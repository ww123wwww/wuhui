package com.example.chufaya.controller;

import com.example.chufaya.dto.UnifiedResponse;
import com.example.chufaya.dto.ChangePasswordRequest;
import com.example.chufaya.dto.UpdateUserInfoRequest;
import com.example.chufaya.dto.UserInfoResponse;
import com.example.chufaya.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/info")
    public UnifiedResponse<UserInfoResponse> getUserInfo(@RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        try {
            UserInfoResponse userInfo = userService.getUserInfo(userId);
            if (userInfo != null) {
                return UnifiedResponse.success("获取用户信息成功", userInfo);
            } else {
                return UnifiedResponse.notFound("用户不存在");
            }
        } catch (Exception e) {
            return UnifiedResponse.error("获取用户信息失败: " + e.getMessage());
        }
    }

    @PutMapping("/info")
    public UnifiedResponse<UserInfoResponse> updateUserInfo(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestBody UpdateUserInfoRequest request) {
        try {
            UserInfoResponse userInfo = userService.updateUserInfo(userId, request.getNickname(), request.getBio(), request.getAvatarUrl());
            if (userInfo != null) {
                return UnifiedResponse.success("更新用户信息成功", userInfo);
            } else {
                return UnifiedResponse.notFound("用户不存在");
            }
        } catch (Exception e) {
            return UnifiedResponse.error("更新用户信息失败: " + e.getMessage());
        }
    }

    @PostMapping("/change-password")
    public UnifiedResponse<String> changePassword(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestBody ChangePasswordRequest request) {
        try {
            if (request.getOldPassword() == null || request.getOldPassword().isEmpty()) {
                return UnifiedResponse.error("请输入旧密码");
            }
            if (request.getNewPassword() == null || request.getNewPassword().isEmpty()) {
                return UnifiedResponse.error("请输入新密码");
            }
            if (request.getNewPassword().length() < 6) {
                return UnifiedResponse.error("新密码长度不能少于6位");
            }

            boolean success = userService.changePassword(userId, request.getOldPassword(), request.getNewPassword());
            if (success) {
                return UnifiedResponse.success("密码修改成功", "success");
            } else {
                return UnifiedResponse.error("旧密码不正确");
            }
        } catch (Exception e) {
            return UnifiedResponse.error("修改密码失败: " + e.getMessage());
        }
    }

    @PostMapping("/logout")
    public UnifiedResponse<String> logout(@RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return UnifiedResponse.success("退出登录成功", "success");
    }

    @PostMapping("/follow")
    public UnifiedResponse<FollowResponse> followUser(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestBody FollowRequest request) {
        try {
            boolean isFollowing = userService.toggleFollow(userId, request.getFolloweeId());
            String message = isFollowing ? "关注成功" : "取消关注成功";
            return UnifiedResponse.success(message, new FollowResponse(isFollowing));
        } catch (Exception e) {
            return UnifiedResponse.error("关注操作失败: " + e.getMessage());
        }
    }

    @GetMapping("/follow/status")
    public UnifiedResponse<FollowStatusResponse> getFollowStatus(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestParam Long followeeId) {
        try {
            boolean isFollowing = userService.isFollowing(userId, followeeId);
            return UnifiedResponse.success("获取关注状态成功", new FollowStatusResponse(isFollowing));
        } catch (Exception e) {
            return UnifiedResponse.error("获取关注状态失败: " + e.getMessage());
        }
    }

    public static class FollowRequest {
        private Long followeeId;

        public Long getFolloweeId() {
            return followeeId;
        }

        public void setFolloweeId(Long followeeId) {
            this.followeeId = followeeId;
        }
    }

    public static class FollowResponse {
        private boolean following;

        public FollowResponse(boolean following) {
            this.following = following;
        }

        public boolean isFollowing() {
            return following;
        }

        public void setFollowing(boolean following) {
            this.following = following;
        }
    }

    public static class FollowStatusResponse {
        private boolean following;

        public FollowStatusResponse(boolean following) {
            this.following = following;
        }

        public boolean isFollowing() {
            return following;
        }

        public void setFollowing(boolean following) {
            this.following = following;
        }
    }
}