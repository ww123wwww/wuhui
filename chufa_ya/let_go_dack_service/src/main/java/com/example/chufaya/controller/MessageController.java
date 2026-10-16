package com.example.chufaya.controller;

import com.example.chufaya.dto.UnifiedResponse;
import com.example.chufaya.dto.request.SendMessageRequest;
import com.example.chufaya.dto.response.ChatSessionResponse;
import com.example.chufaya.dto.response.MessageResponse;
import com.example.chufaya.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/message")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping("/send")
    public UnifiedResponse<MessageResponse> sendMessage(@RequestBody SendMessageRequest request) {
        MessageResponse response = messageService.sendMessage(request.getSenderId(), request.getReceiverId(), request.getContent());
        return UnifiedResponse.success(response);
    }

    @GetMapping("/list")
    public UnifiedResponse<List<MessageResponse>> getChatMessages(
            @RequestParam Long userId,
            @RequestParam Long targetUserId) {
        List<MessageResponse> messages = messageService.getMessagesBetweenUsers(userId, targetUserId);
        return UnifiedResponse.success(messages);
    }

    @GetMapping("/chat-list")
    public UnifiedResponse<List<ChatSessionResponse>> getChatList(
            @RequestParam Long userId) {
        List<ChatSessionResponse> chatList = messageService.getChatList(userId);
        return UnifiedResponse.success(chatList);
    }
}