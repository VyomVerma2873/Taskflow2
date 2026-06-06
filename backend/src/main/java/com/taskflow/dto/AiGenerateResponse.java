package com.taskflow.dto;

import com.taskflow.model.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiGenerateResponse {
    private String description;
    private Priority suggestedPriority;
    private String estimatedTime;
}
