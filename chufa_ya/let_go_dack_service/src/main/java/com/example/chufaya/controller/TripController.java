package com.example.chufaya.controller;

import com.example.chufaya.dto.UnifiedResponse;
import com.example.chufaya.entity.UserTrip;
import com.example.chufaya.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trip")
public class TripController {
    
    @Autowired
    private TripService tripService;
    
    @PostMapping("/save")
    public UnifiedResponse saveToTrip(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.parseLong(request.get("userId").toString());
            Long contentId = Long.parseLong(request.get("contentId").toString());
            
            boolean success = tripService.saveTrip(userId, contentId);
            
            Map<String, Object> data = new HashMap<>();
            data.put("saved", success);
            
            return UnifiedResponse.success(data);
        } catch (Exception e) {
            e.printStackTrace();
            return UnifiedResponse.error("保存失败");
        }
    }
    
    @GetMapping("/user/trips")
    public UnifiedResponse getUserTrips(@RequestParam("userId") Long userId) {
        try {
            List<UserTrip> trips = tripService.getUserTrips(userId);
            return UnifiedResponse.success(trips);
        } catch (Exception e) {
            e.printStackTrace();
            return UnifiedResponse.error("获取行程失败");
        }
    }
    
    @PostMapping("/update/status")
    public UnifiedResponse updateTripStatus(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.parseLong(request.get("userId").toString());
            Long tripId = Long.parseLong(request.get("tripId").toString());
            String status = (String) request.get("status");

            boolean success = tripService.updateTripStatus(tripId, status);

            Map<String, Object> data = new HashMap<>();
            data.put("updated", success);

            return UnifiedResponse.success(data);
        } catch (Exception e) {
            e.printStackTrace();
            return UnifiedResponse.error("更新失败");
        }
    }

    @PostMapping("/remove")
    public UnifiedResponse removeTrip(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.parseLong(request.get("userId").toString());
            Long contentId = Long.parseLong(request.get("contentId").toString());

            boolean success = tripService.removeTrip(userId, contentId);

            Map<String, Object> data = new HashMap<>();
            data.put("removed", success);

            return UnifiedResponse.success(data);
        } catch (Exception e) {
            e.printStackTrace();
            return UnifiedResponse.error("移除失败");
        }
    }

    @GetMapping("/check")
    public UnifiedResponse checkTripSaved(@RequestParam("userId") Long userId, @RequestParam("contentId") Long contentId) {
        try {
            boolean saved = tripService.isTripSaved(userId, contentId);

            Map<String, Object> data = new HashMap<>();
            data.put("saved", saved);

            return UnifiedResponse.success(data);
        } catch (Exception e) {
            e.printStackTrace();
            return UnifiedResponse.error("查询失败");
        }
    }
}