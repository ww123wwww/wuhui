package com.example.chufaya.mapper;

import com.example.chufaya.entity.Message;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.Map;

@Mapper
public interface MessageMapper {

    @Insert("INSERT INTO messages (sender_id, receiver_id, content, is_read, send_time) VALUES (#{senderId}, #{receiverId}, #{content}, #{isRead}, #{sendTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Message message);

    @Select("SELECT * FROM messages WHERE (sender_id = #{userId1} AND receiver_id = #{userId2}) OR (sender_id = #{userId2} AND receiver_id = #{userId1}) ORDER BY send_time ASC")
    List<Message> findMessagesBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    @Select("SELECT DISTINCT CASE WHEN sender_id = #{userId} THEN receiver_id ELSE sender_id END as other_id FROM messages WHERE sender_id = #{userId} OR receiver_id = #{userId}")
    List<Long> findChatUserIds(Long userId);
    
    @Select("SELECT * FROM messages WHERE (sender_id = #{userId} AND receiver_id = #{otherId}) OR (sender_id = #{otherId} AND receiver_id = #{userId}) ORDER BY send_time DESC LIMIT 1")
    Message findLastMessage(Long userId, Long otherId);
    
    @Select("SELECT user_id, nickname, avatar_url FROM users WHERE user_id = #{userId}")
    Map<String, Object> findUserInfo(Long userId);

    @Select("SELECT COUNT(*) FROM messages WHERE receiver_id = #{userId} AND is_read = 0 AND sender_id = #{senderId}")
    int countUnread(Long userId, Long senderId);

    @Update("UPDATE messages SET is_read = 1 WHERE receiver_id = #{userId} AND sender_id = #{senderId}")
    int markAsRead(Long userId, Long senderId);
}