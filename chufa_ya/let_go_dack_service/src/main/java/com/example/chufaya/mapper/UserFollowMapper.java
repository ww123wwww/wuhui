package com.example.chufaya.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserFollowMapper {
    int countFollow(@Param("followerId") Long followerId, @Param("followeeId") Long followeeId);
    
    int insertFollow(@Param("followerId") Long followerId, @Param("followeeId") Long followeeId);
    
    int deleteFollow(@Param("followerId") Long followerId, @Param("followeeId") Long followeeId);
    
    int updateFollowStatus(@Param("followerId") Long followerId, @Param("followeeId") Long followeeId, @Param("status") int status);
}