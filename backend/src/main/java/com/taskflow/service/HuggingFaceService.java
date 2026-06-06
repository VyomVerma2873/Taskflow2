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
public class HuggingFaceService {

    @Value("${hf.api.key}")
    private String apiKey;

    @Value("${hf.api.url}")
    private String apiUrl;

    @Value("${hf.model}")
    private String modelName;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    public AiGenerateResponse generateTaskDetails(String taskTitle) {
        log.info("Generating task details via Hugging Face for title: {}", taskTitle);

        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("YOUR_HF_API_KEY")) {
            log.warn("Hugging Face API key is not configured. Skipping Hugging Face invocation.");
            return null;
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

            // Construct payload matching OpenAI Chat Completion standard
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", modelName);
            
            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", prompt);
            
            requestBody.put("messages", List.of(userMessage));
            requestBody.put("max_tokens", 800);
            requestBody.put("temperature", 0.7);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return parseHuggingFaceResponse(response.getBody(), taskTitle);
            } else {
                log.warn("Hugging Face API returned status code: {}", response.getStatusCode());
                return null;
            }

        } catch (Exception e) {
            log.error("Error calling Hugging Face API: {}", e.getMessage(), e);
            return null;
        }
    }

    private AiGenerateResponse parseHuggingFaceResponse(String responseBody, String title) {
        try {
            JsonNode rootNode = objectMapper.readTree(responseBody);
            
            // Extract content from choices[0].message.content
            JsonNode contentNode = rootNode
                    .path("choices")
                    .path(0)
                    .path("message")
                    .path("content");

            if (contentNode.isMissingNode() || contentNode.asText().isEmpty()) {
                log.warn("Hugging Face response did not contain content choices. Raw: {}", responseBody);
                return null;
            }

            String jsonText = contentNode.asText().trim();
            
            // Clean up ```json wrapper tags if returned by LLM
            if (jsonText.startsWith("```")) {
                int firstBreak = jsonText.indexOf("\n");
                int lastTicks = jsonText.lastIndexOf("```");
                if (firstBreak != -1 && lastTicks != -1 && lastTicks > firstBreak) {
                    jsonText = jsonText.substring(firstBreak + 1, lastTicks).trim();
                }
            }

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
            log.error("Failed to parse Hugging Face response: {}", e.getMessage());
            return null;
        }
    }
}
