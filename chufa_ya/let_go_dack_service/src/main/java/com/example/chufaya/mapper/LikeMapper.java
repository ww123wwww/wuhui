package com.example.chufaya.mapper;

import com.example.chufaya.entity.Activity;
import com.example.chufaya.entity.ContentInfo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface LikeMapper {
    int countLike(@Param("userId") Long userId, @Param("contentId") Long contentId, @Param("contentType") String contentType);

    int insertLike(@Param("userId") Long userId, @Param("contentId") Long contentId, @Param("contentType") String contentType);

    int deleteLike(@Param("userId") Long userId, @Param("contentId") Long contentId, @Param("contentType") String contentType);

    List<ContentInfo> findLikedContents(@Param("userId") Long userId, @Param("offset") int offset, @Param("pageSize") int pageSize);

    int countLikedContents(@Param("userId") Long userId);

    List<Activity> findLikedActivities(@Param("userId") Long userId, @Param("offset") int offset, @Param("pageSize") int pageSize);

    int countLikedActivities(@Param("userId") Long userId);
}
