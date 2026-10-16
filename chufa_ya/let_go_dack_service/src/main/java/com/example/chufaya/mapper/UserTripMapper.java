package com.example.chufaya.mapper;

import com.example.chufaya.entity.UserTrip;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface UserTripMapper {
    
    @Insert("INSERT INTO user_trip (user_id, content_id, content_type, title, cover_url, location, status, created_at) " +
            "VALUES (#{userId}, #{contentId}, #{contentType}, #{title}, #{coverUrl}, #{location}, 'Planning', NOW())")
    int insert(UserTrip trip);
    
    @Select("SELECT * FROM user_trip WHERE user_id = #{userId} ORDER BY created_at DESC")
    List<UserTrip> findByUserId(Long userId);
    
    @Select("SELECT * FROM user_trip WHERE user_id = #{userId} AND content_id = #{contentId}")
    UserTrip findByUserIdAndContentId(Long userId, Long contentId);
    
    @Select("SELECT COUNT(*) FROM user_trip WHERE user_id = #{userId} AND content_id = #{contentId}")
    int countByUserIdAndContentId(Long userId, Long contentId);
    
    @Update("UPDATE user_trip SET status = #{status} WHERE id = #{tripId}")
    int updateStatus(Long tripId, String status);

    @org.apache.ibatis.annotations.Delete("DELETE FROM user_trip WHERE user_id = #{userId} AND content_id = #{contentId}")
    int deleteByUserIdAndContentId(Long userId, Long contentId);
}