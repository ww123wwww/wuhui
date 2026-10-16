package com.example.chufaya.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Activity {
    private Long activityId;
    private Long userId;
    private String coverImg;
    private String title;
    private String address;
    private String startDate;
    private String endDate;
    private Integer totalNum;
    private Integer joinNum;
    private String detail;
    private Integer status; // 0-招募中 1-已满员
    private Integer likeCount;
    private Integer collectCount;
    private LocalDateTime createTime;

    // 展示用瞬态字段（JOIN users 表获取）
    private String nickname;
    private String avatarUrl;

    // 是否已加入（瞬态字段，不存入数据库）
    private Boolean joined;

    // 是否已点赞/已收藏（瞬态字段，不存入数据库）
    private Boolean liked;
    private Boolean collected;
}
