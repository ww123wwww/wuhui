package com.example.chufaya.service;

import com.example.chufaya.dto.UserInfoResponse;
import com.example.chufaya.entity.User;
import com.example.chufaya.mapper.UserFollowMapper;
import com.example.chufaya.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private UserFollowMapper userFollowMapper;

    public UserInfoResponse getUserInfo(Long userId) {
        User user = userMapper.findById(userId);
        if (user == null) {
            return null;
        }
        UserInfoResponse response = new UserInfoResponse();
        response.setUserId(user.getUserId());
        response.setNickname(user.getNickname());
        response.setDuckId(user.getDuckId());
        response.setIpLocation(user.getIpLocation());
        response.setBio(user.getBio());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setFollowCount(user.getFollowCount());
        response.setFansCount(user.getFansCount());
        response.setLikeCount(user.getLikeCount());
        return response;
    }

    public UserInfoResponse updateUserInfo(Long userId, String nickname, String bio, String avatarUrl) {
        User user = userMapper.findById(userId);
        if (user == null) {
            return null;
        }

        if (nickname != null && !nickname.isEmpty()) {
            user.setNickname(nickname);
        }
        if (bio != null) {
            user.setBio(bio);
        }
        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl);
        }

        userMapper.updateUserInfo(user);
        return getUserInfo(userId);
    }

    public boolean isFollowing(Long followerId, Long followeeId) {
        return userFollowMapper.countFollow(followerId, followeeId) > 0;
    }

    public boolean changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userMapper.findById(userId);
        if (user == null) {
            return false;
        }

        // 验证旧密码（明文存储，直接比较）
        if (!oldPassword.equals(user.getPasswordHash())) {
            return false;
        }

        // 更新新密码
        userMapper.updatePassword(userId, newPassword);
        return true;
    }

    public boolean toggleFollow(Long followerId, Long followeeId) {
        boolean isFollowing = isFollowing(followerId, followeeId);
        
        if (isFollowing) {
            userFollowMapper.deleteFollow(followerId, followeeId);
            userMapper.decrementFollowCount(followerId);
            userMapper.decrementFansCount(followeeId);
            return false;
        } else {
            userFollowMapper.insertFollow(followerId, followeeId);
            userMapper.incrementFollowCount(followerId);
            userMapper.incrementFansCount(followeeId);
            return true;
        }
    }
}