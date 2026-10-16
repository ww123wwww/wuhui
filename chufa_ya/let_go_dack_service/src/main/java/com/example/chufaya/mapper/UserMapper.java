package com.example.chufaya.mapper;

import com.example.chufaya.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    User findById(@Param("userId") Long userId);

    User findByPhone(@Param("phone") String phone);

    int insert(User user);

    int updateUserInfo(User user);

    int incrementFollowCount(@Param("userId") Long userId);

    int decrementFollowCount(@Param("userId") Long userId);

    int incrementFansCount(@Param("userId") Long userId);

    int decrementFansCount(@Param("userId") Long userId);

    int updatePassword(@Param("userId") Long userId, @Param("passwordHash") String passwordHash);
}