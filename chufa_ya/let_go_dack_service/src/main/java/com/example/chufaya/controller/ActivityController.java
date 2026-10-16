package com.example.chufaya.controller;

import com.example.chufaya.dto.UnifiedResponse;
import com.example.chufaya.entity.Activity;
import com.example.chufaya.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/activity")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    /**
     * 获取活动列表
     */
    @GetMapping("/list")
    public UnifiedResponse getActivityList(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Map<String, Object> result = activityService.getActivityListWithJoinStatus(userId, page, size);
            return UnifiedResponse.success(result);
        } catch (Exception e) {
            e.printStackTrace();
            return UnifiedResponse.error("获取活动列表失败");
        }
    }

    /**
     * 获取活动详情
     */
    @GetMapping("/detail")
    public UnifiedResponse getActivityDetail(@RequestParam("id") Long activityId,
                                             @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        try {
            Activity activity = activityService.getActivityDetail(activityId);
            if (activity == null) {
                return UnifiedResponse.notFound("活动不存在");
            }
            // 检查当前用户是否已加入、已点赞、已收藏
            boolean joined = activityService.isJoinedActivity(activityId, userId);
            boolean liked = activityService.isLikedActivity(activityId, userId);
            boolean collected = activityService.isCollectedActivity(activityId, userId);
            activity.setJoined(joined);
            activity.setLiked(liked);
            activity.setCollected(collected);
            return UnifiedResponse.success(activity);
        } catch (Exception e) {
            e.printStackTrace();
            return UnifiedResponse.error("获取活动详情失败");
        }
    }

    /**
     * 发布新活动
     */
    @PostMapping("/publish")
    public UnifiedResponse publishActivity(@RequestBody Activity activity,
                                           @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        try {
            // 参数校验
            if (activity.getTitle() == null || activity.getTitle().trim().isEmpty()) {
                return UnifiedResponse.error("活动标题不能为空");
            }
            if (activity.getAddress() == null || activity.getAddress().trim().isEmpty()) {
                return UnifiedResponse.error("目的地不能为空");
            }
            if (activity.getStartDate() == null || activity.getEndDate() == null) {
                return UnifiedResponse.error("行程日期不能为空");
            }
            if (activity.getTotalNum() == null || activity.getTotalNum() < 2) {
                return UnifiedResponse.error("期待人数至少为2人");
            }

            activity.setUserId(userId);
            Activity result = activityService.publishActivity(activity);
            if (result != null) {
                return UnifiedResponse.success("发布成功", result);
            }
            return UnifiedResponse.error("发布失败");
        } catch (Exception e) {
            e.printStackTrace();
            return UnifiedResponse.error("发布失败");
        }
    }

    /**
     * 加入活动
     */
    @PostMapping("/join")
    public UnifiedResponse joinActivity(@RequestBody Map<String, Long> request,
                                        @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        try {
            Long activityId = request.get("activityId");
            if (activityId == null) {
                return UnifiedResponse.error("活动ID不能为空");
            }

            int result = activityService.joinActivity(activityId, userId);
            switch (result) {
                case 0:
                    return UnifiedResponse.success("加入成功", null);
                case 1:
                    return UnifiedResponse.notFound("活动不存在");
                case 2:
                    return UnifiedResponse.error("活动已满员，无法加入");
                case 3:
                    return UnifiedResponse.error("不能加入自己发布的活动");
                case 4:
                    return UnifiedResponse.error("您已经加入过该活动");
                default:
                    return UnifiedResponse.error("加入失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return UnifiedResponse.error("加入失败");
        }
    }

    /**
     * 退出活动
     */
    @PostMapping("/quit")
    public UnifiedResponse quitActivity(@RequestBody Map<String, Long> request,
                                        @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        try {
            Long activityId = request.get("activityId");
            if (activityId == null) {
                return UnifiedResponse.error("活动ID不能为空");
            }

            int result = activityService.quitActivity(activityId, userId);
            switch (result) {
                case 0:
                    return UnifiedResponse.success("退出成功", null);
                case 1:
                    return UnifiedResponse.notFound("活动不存在");
                case 2:
                    return UnifiedResponse.error("您未加入过该活动");
                default:
                    return UnifiedResponse.error("退出失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return UnifiedResponse.error("退出失败");
        }
    }

    /**
     * 搜索活动
     */
    @GetMapping("/search")
    public UnifiedResponse searchActivities(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestParam("keyword") String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                return UnifiedResponse.error("搜索关键词不能为空");
            }
            Map<String, Object> result = activityService.searchActivitiesWithJoinStatus(keyword.trim(), userId, page, size);
            return UnifiedResponse.success(result);
        } catch (Exception e) {
            e.printStackTrace();
            return UnifiedResponse.error("搜索失败");
        }
    }

    /**
     * 获取用户已加入的活动列表
     */
    @GetMapping("/joined")
    public UnifiedResponse getJoinedActivities(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Map<String, Object> result = activityService.getJoinedActivities(userId, page, size);
            return UnifiedResponse.success(result);
        } catch (Exception e) {
            e.printStackTrace();
            return UnifiedResponse.error("获取已加入活动列表失败");
        }
    }

    /**
     * 点赞/取消点赞活动
     */
    @PostMapping("/like")
    public UnifiedResponse likeActivity(@RequestBody Map<String, Long> request,
                                        @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        try {
            Long activityId = request.get("activityId");
            if (activityId == null) {
                return UnifiedResponse.error("活动ID不能为空");
            }

            boolean liked = activityService.likeActivity(activityId, userId);
            return UnifiedResponse.success(liked ? "点赞成功" : "取消点赞成功", liked);
        } catch (Exception e) {
            e.printStackTrace();
            return UnifiedResponse.error("操作失败");
        }
    }

    /**
     * 收藏/取消收藏活动
     */
    @PostMapping("/collect")
    public UnifiedResponse collectActivity(@RequestBody Map<String, Long> request,
                                           @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        try {
            Long activityId = request.get("activityId");
            if (activityId == null) {
                return UnifiedResponse.error("活动ID不能为空");
            }

            boolean collected = activityService.collectActivity(activityId, userId);
            return UnifiedResponse.success(collected ? "收藏成功" : "取消收藏成功", collected);
        } catch (Exception e) {
            e.printStackTrace();
            return UnifiedResponse.error("操作失败");
        }
    }
}
