package com.example.chufaya.mapper;

import com.example.chufaya.entity.Activity;
import com.example.chufaya.entity.ContentInfo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CollectionMapper {
    int countCollection(@Param("userId") Long userId, @Param("contentId") Long contentId, @Param("contentType") String contentType);

    int insertCollection(@Param("userId") Long userId, @Param("contentId") Long contentId, @Param("contentType") String contentType);

    int deleteCollection(@Param("userId") Long userId, @Param("contentId") Long contentId, @Param("contentType") String contentType);

    List<ContentInfo> findCollectedContents(@Param("userId") Long userId, @Param("offset") int offset, @Param("pageSize") int pageSize);

    int countCollectedContents(@Param("userId") Long userId);

    List<Activity> findCollectedActivities(@Param("userId") Long userId, @Param("offset") int offset, @Param("pageSize") int pageSize);

    int countCollectedActivities(@Param("userId") Long userId);
}
