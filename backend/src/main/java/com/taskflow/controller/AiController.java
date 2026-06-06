package com.taskflow.controller;

import com.taskflow.dto.AiGenerateRequest;
import com.taskflow.dto.AiGenerateResponse;
import com.taskflow.service.GeminiService;
import com.taskflow.service.HuggingFaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final HuggingFaceService huggingFaceService;
    private final GeminiService geminiService;

    @PostMapping("/generate")
    public ResponseEntity<AiGenerateResponse> generateTaskDetails(@Valid @RequestBody AiGenerateRequest request) {
        // Try Hugging Face first
        AiGenerateResponse response = huggingFaceService.generateTaskDetails(request.getTitle());
        
        // If Hugging Face is not configured or fails, fall back to Gemini
        if (response == null) {
            response = geminiService.generateTaskDetails(request.getTitle());
        }
        
        return ResponseEntity.ok(response);
    }
}
