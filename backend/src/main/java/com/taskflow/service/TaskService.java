package com.taskflow.service;

import com.taskflow.dto.TaskRequest;
import com.taskflow.dto.TaskResponse;
import com.taskflow.model.Task;
import com.taskflow.model.User;
import com.taskflow.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserService userService;

    public List<TaskResponse> getAllTasksForCurrentUser() {
        User currentUser = userService.getCurrentUser();
        List<Task> tasks = taskRepository.findByUserOrderByCreatedAtDesc(currentUser);
        return tasks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TaskResponse getTaskById(Long id) {
        Task task = getTaskEntity(id);
        return mapToResponse(task);
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        User currentUser = userService.getCurrentUser();
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(request.getStatus())
                .dueDate(request.getDueDate())
                .estimatedTime(request.getEstimatedTime())
                .user(currentUser)
                .build();

        Task savedTask = taskRepository.save(task);
        return mapToResponse(savedTask);
    }

    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = getTaskEntity(id);

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus());
        task.setDueDate(request.getDueDate());
        task.setEstimatedTime(request.getEstimatedTime());

        Task updatedTask = taskRepository.save(task);
        return mapToResponse(updatedTask);
    }

    @Transactional
    public void deleteTask(Long id) {
        Task task = getTaskEntity(id);
        taskRepository.delete(task);
    }

    private Task getTaskEntity(Long id) {
        User currentUser = userService.getCurrentUser();
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + id));

        if (!task.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to access this task");
        }
        return task;
    }

    private TaskResponse mapToResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority())
                .status(task.getStatus())
                .dueDate(task.getDueDate())
                .estimatedTime(task.getEstimatedTime())
                .createdAt(task.getCreatedAt())
                .build();
    }
}
