package com.example.chufaya.service;

import com.example.chufaya.entity.ContentInfo;
import com.example.chufaya.entity.UserTrip;
import com.example.chufaya.mapper.ContentInfoMapper;
import com.example.chufaya.mapper.UserTripMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TripService {
    
    @Autowired
    private UserTripMapper userTripMapper;
    
    @Autowired
    private ContentInfoMapper contentInfoMapper;
    
    @Transactional
    public boolean saveTrip(Long userId, Long contentId) {
        // 检查是否已存在
        UserTrip existingTrip = userTripMapper.findByUserIdAndContentId(userId, contentId);
        if (existingTrip != null) {
            // 如果已存在且状态为已完成，改为规划中
            if ("Completed".equals(existingTrip.getStatus())) {
                userTripMapper.updateStatus(existingTrip.getId(), "Planning");
            }
            return true;
        }
        
        // 获取内容信息
        ContentInfo content = contentInfoMapper.findById(contentId);
        if (content == null) {
            return false;
        }
        
        UserTrip trip = new UserTrip();
        trip.setUserId(userId);
        trip.setContentId(contentId);
        trip.setContentType(content.getContentType());
        trip.setTitle(content.getTitle());
        trip.setCoverUrl(content.getCoverUrl());
        trip.setLocation(content.getLocation());
        trip.setStatus("Planning");
        
        return userTripMapper.insert(trip) > 0;
    }
    
    public List<UserTrip> getUserTrips(Long userId) {
        return userTripMapper.findByUserId(userId);
    }
    
    @Transactional
    public boolean updateTripStatus(Long tripId, String status) {
        return userTripMapper.updateStatus(tripId, status) > 0;
    }

    public boolean removeTrip(Long userId, Long contentId) {
        return userTripMapper.deleteByUserIdAndContentId(userId, contentId) > 0;
    }

    public boolean isTripSaved(Long userId, Long contentId) {
        return userTripMapper.countByUserIdAndContentId(userId, contentId) > 0;
    }
}