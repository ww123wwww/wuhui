package com.example.chufaya.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserTrip {
    private Long id;
    private Long userId;
    private Long contentId;
    private String contentType;
    private String title;
    private String coverUrl;
    private String location;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status; // Planning, Completed
    private LocalDateTime createdAt;
}