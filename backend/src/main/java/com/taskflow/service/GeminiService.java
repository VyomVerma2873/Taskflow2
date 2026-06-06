package com.taskflow.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.dto.AiGenerateResponse;
import com.taskflow.model.Priority;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    public AiGenerateResponse generateTaskDetails(String taskTitle) {
        log.info("Generating task details for title: {}", taskTitle);

        // Check if API key is present
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("YOUR_API_KEY")) {
            log.warn("Gemini API key is not configured. Using fallback task generation.");
            return getFallbackTaskDetails(taskTitle, "Gemini API key is not configured.");
        }

        try {
            String prompt = String.format(
                "Generate a task description, suggested priority, and estimated completion time/effort for a task with the title: '%s'.\n" +
                "Requirements:\n" +
                "1. The description should be detailed, structured in markdown, and include objectives, action items, and criteria.\n" +
                "2. The suggestedPriority must be exactly one of: 'LOW', 'MEDIUM', 'HIGH'.\n" +
                "3. The estimatedTime should be a user-friendly estimate (e.g. '2 hours', '1 day', '3-5 days').\n" +
                "Return your response as a JSON object with the exact keys: 'description', 'suggestedPriority', and 'estimatedTime'. " +
                "Do not surround the JSON with markdown tags, return ONLY the raw JSON string.",
                taskTitle
            );

            // Construct Gemini request payload
            Map<String, Object> requestBody = new HashMap<>();
            
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);
            
            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(part));
            
            requestBody.put("contents", List.of(content));

            // Set JSON response config
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("responseMimeType", "application/json");
            requestBody.put("generationConfig", generationConfig);

            // HTTP headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Call Gemini API
            String requestUrl = String.format("%s?key=%s", apiUrl, apiKey);
            ResponseEntity<String> response = restTemplate.postForEntity(requestUrl, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return parseGeminiResponse(response.getBody(), taskTitle);
            } else {
                log.warn("Gemini API returned status code: {}", response.getStatusCode());
                return getFallbackTaskDetails(taskTitle, "API response status: " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Error calling Gemini API: {}", e.getMessage(), e);
            return getFallbackTaskDetails(taskTitle, e.getMessage());
        }
    }

    private AiGenerateResponse parseGeminiResponse(String responseBody, String title) {
        try {
            JsonNode rootNode = objectMapper.readTree(responseBody);
            
            // Extract the generated text from Gemini response structure:
            // candidates[0].content.parts[0].text
            JsonNode textNode = rootNode
                    .path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");

            if (textNode.isMissingNode() || textNode.asText().isEmpty()) {
                log.warn("Gemini API response did not contain the text element. Raw response: {}", responseBody);
                return getFallbackTaskDetails(title, "Missing text in candidates response.");
            }

            String jsonText = textNode.asText();
            JsonNode generatedJson = objectMapper.readTree(jsonText);

            String description = generatedJson.path("description").asText("").trim();
            String priorityStr = generatedJson.path("suggestedPriority").asText("MEDIUM").toUpperCase().trim();
            String estimatedTime = generatedJson.path("estimatedTime").asText("1-2 hours").trim();

            Priority priority;
            try {
                priority = Priority.valueOf(priorityStr);
            } catch (IllegalArgumentException e) {
                priority = Priority.MEDIUM;
            }

            if (description.isEmpty()) {
                description = "Plan and execute tasks related to: " + title;
            }

            return AiGenerateResponse.builder()
                    .description(description)
                    .suggestedPriority(priority)
                    .estimatedTime(estimatedTime)
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", e.getMessage());
            return getFallbackTaskDetails(title, "JSON parsing error: " + e.getMessage());
        }
    }

    private AiGenerateResponse getFallbackTaskDetails(String title, String reason) {
        log.info("Generating fallback details for task '{}' (Reason: {})", title, reason);

        // Dynamically create a high-quality markdown description based on the title
        String markdownDescription = String.format(
            "### Objectives\n" +
            "Draft and execute a structured plan for the task: **%s**.\n\n" +
            "### Suggested Action Items\n" +
            "- [ ] Review requirements and scope out dependencies.\n" +
            "- [ ] Set up the development workspace or resource requirements.\n" +
            "- [ ] Implement core functions and verify correctness.\n" +
            "- [ ] Perform testing and clean up resources.\n\n" +
            "### Notes\n" +
            "*Fallback generated because Gemini API was unavailable (%s).* ",
            title, reason
        );

        // Deduce a plausible suggested priority
        Priority priority = Priority.MEDIUM;
        String lowerTitle = title.toLowerCase();
        if (lowerTitle.contains("critical") || lowerTitle.contains("urgent") || lowerTitle.contains("bug") || lowerTitle.contains("fix")) {
            priority = Priority.HIGH;
        } else if (lowerTitle.contains("low") || lowerTitle.contains("minor") || lowerTitle.contains("easy")) {
            priority = Priority.LOW;
        }

        return AiGenerateResponse.builder()
                .description(markdownDescription)
                .suggestedPriority(priority)
                .estimatedTime("2-4 hours")
                .build();
    }
}
