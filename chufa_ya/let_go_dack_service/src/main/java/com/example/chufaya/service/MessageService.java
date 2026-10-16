package com.example.chufaya.service;

import com.example.chufaya.dto.response.ChatSessionResponse;
import com.example.chufaya.dto.response.MessageResponse;
import com.example.chufaya.entity.Message;
import com.example.chufaya.mapper.MessageMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class MessageService {

    @Autowired
    private MessageMapper messageMapper;

    public MessageResponse sendMessage(Long senderId, Long receiverId, String content) {
        Message message = new Message(senderId, receiverId, content);
        messageMapper.insert(message);
        return new MessageResponse(message.getId(), senderId, receiverId, content, message.getSendTime());
    }

    public List<MessageResponse> getMessagesBetweenUsers(Long userId1, Long userId2) {
        List<Message> messages = messageMapper.findMessagesBetweenUsers(userId1, userId2);
        
        // Mark messages as read when user views them
        messageMapper.markAsRead(userId1, userId2);
        
        List<MessageResponse> responseList = new ArrayList<>();
        for (Message m : messages) {
            responseList.add(new MessageResponse(m.getId(), m.getSenderId(), m.getReceiverId(), m.getContent(), m.getSendTime()));
        }
        return responseList;
    }

    public List<ChatSessionResponse> getChatList(Long userId) {
        List<ChatSessionResponse> chatList = new ArrayList<>();
        
        // 获取有过聊天的用户ID列表
        List<Long> userIds = messageMapper.findChatUserIds(userId);
        
        for (Long otherId : userIds) {
            // 获取最后一条消息
            Message lastMsg = messageMapper.findLastMessage(userId, otherId);
            
            // 获取用户信息
            Map<String, Object> userInfo = messageMapper.findUserInfo(otherId);
            
            ChatSessionResponse session = new ChatSessionResponse();
            session.setId(otherId);
            session.setUserId(otherId);
            session.setNickname(userInfo != null ? (String) userInfo.get("nickname") : "未知用户");
            session.setAvatarUrl(userInfo != null ? (String) userInfo.get("avatar_url") : null);
            session.setLastMessage(lastMsg != null ? lastMsg.getContent() : "");
            session.setLastTime(lastMsg != null ? lastMsg.getSendTime() : null);
            session.setUnreadCount(messageMapper.countUnread(userId, otherId));
            
            chatList.add(session);
        }
        
        return chatList;
    }
}