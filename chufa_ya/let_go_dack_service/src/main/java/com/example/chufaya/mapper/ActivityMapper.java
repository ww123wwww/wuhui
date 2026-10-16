package com.example.chufaya.mapper;

import com.example.chufaya.entity.Activity;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ActivityMapper {

    @Insert("INSERT INTO activity (user_id, cover_img, title, address, start_date, end_date, total_num, join_num, detail, status, create_time) " +
            "VALUES (#{userId}, #{coverImg}, #{title}, #{address}, #{startDate}, #{endDate}, #{totalNum}, 0, #{detail}, 0, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "activityId")
    int insert(Activity activity);

    @Select("SELECT a.*, u.nickname, u.avatar_url AS avatarUrl FROM activity a " +
            "LEFT JOIN users u ON a.user_id = u.user_id " +
            "WHERE a.activity_id = #{activityId}")
    Activity findById(@Param("activityId") Long activityId);

    @Select("SELECT a.*, u.nickname, u.avatar_url AS avatarUrl FROM activity a " +
            "LEFT JOIN users u ON a.user_id = u.user_id " +
            "ORDER BY a.create_time DESC LIMIT #{offset}, #{limit}")
    List<Activity> findAll(@Param("offset") int offset, @Param("limit") int limit);

    @Select("SELECT a.*, u.nickname, u.avatar_url AS avatarUrl, " +
            "CASE WHEN aj.user_id IS NOT NULL THEN true ELSE false END AS joined " +
            "FROM activity a " +
            "LEFT JOIN users u ON a.user_id = u.user_id " +
            "LEFT JOIN activity_join aj ON a.activity_id = aj.activity_id AND aj.user_id = #{userId} " +
            "ORDER BY a.create_time DESC LIMIT #{offset}, #{limit}")
    List<Activity> findAllWithJoinStatus(@Param("userId") Long userId, @Param("offset") int offset, @Param("limit") int limit);

    @Select("SELECT COUNT(*) FROM activity")
    int countAll();

    @Select("SELECT a.*, u.nickname, u.avatar_url AS avatarUrl FROM activity a " +
            "LEFT JOIN users u ON a.user_id = u.user_id " +
            "WHERE a.title LIKE CONCAT('%', #{keyword}, '%') OR a.address LIKE CONCAT('%', #{keyword}, '%') " +
            "ORDER BY a.create_time DESC LIMIT #{offset}, #{limit}")
    List<Activity> searchByKeyword(@Param("keyword") String keyword, @Param("offset") int offset, @Param("limit") int limit);

    @Select("SELECT a.*, u.nickname, u.avatar_url AS avatarUrl, " +
            "CASE WHEN aj.user_id IS NOT NULL THEN true ELSE false END AS joined " +
            "FROM activity a " +
            "LEFT JOIN users u ON a.user_id = u.user_id " +
            "LEFT JOIN activity_join aj ON a.activity_id = aj.activity_id AND aj.user_id = #{userId} " +
            "WHERE a.title LIKE CONCAT('%', #{keyword}, '%') OR a.address LIKE CONCAT('%', #{keyword}, '%') " +
            "ORDER BY a.create_time DESC LIMIT #{offset}, #{limit}")
    List<Activity> searchByKeywordWithJoinStatus(@Param("keyword") String keyword, @Param("userId") Long userId, @Param("offset") int offset, @Param("limit") int limit);

    @Select("SELECT COUNT(*) FROM activity WHERE title LIKE CONCAT('%', #{keyword}, '%') OR address LIKE CONCAT('%', #{keyword}, '%')")
    int countByKeyword(@Param("keyword") String keyword);

    @Update("UPDATE activity SET join_num = join_num + 1 WHERE activity_id = #{activityId} AND join_num < total_num")
    int incrementJoinNum(@Param("activityId") Long activityId);

    @Update("UPDATE activity SET status = #{status} WHERE activity_id = #{activityId}")
    int updateStatus(@Param("activityId") Long activityId, @Param("status") Integer status);

    @Select("SELECT COUNT(*) FROM activity WHERE activity_id = #{activityId} AND user_id = #{userId}")
    int countByActivityIdAndUserId(@Param("activityId") Long activityId, @Param("userId") Long userId);

    // ========== activity_join 表操作 ==========

    @Insert("INSERT INTO activity_join (activity_id, user_id) VALUES (#{activityId}, #{userId})")
    int insertActivityJoin(@Param("activityId") Long activityId, @Param("userId") Long userId);

    @Select("SELECT COUNT(*) FROM activity_join WHERE activity_id = #{activityId} AND user_id = #{userId}")
    int countActivityJoin(@Param("activityId") Long activityId, @Param("userId") Long userId);

    @Delete("DELETE FROM activity_join WHERE activity_id = #{activityId} AND user_id = #{userId}")
    int deleteActivityJoin(@Param("activityId") Long activityId, @Param("userId") Long userId);

    @Update("UPDATE activity SET join_num = join_num - 1 WHERE activity_id = #{activityId} AND join_num > 0")
    int decrementJoinNum(@Param("activityId") Long activityId);

    @Select("SELECT a.*, u.nickname, u.avatar_url AS avatarUrl FROM activity a " +
            "LEFT JOIN users u ON a.user_id = u.user_id " +
            "INNER JOIN activity_join aj ON a.activity_id = aj.activity_id " +
            "WHERE aj.user_id = #{userId} " +
            "ORDER BY aj.join_time DESC LIMIT #{offset}, #{limit}")
    List<Activity> findJoinedActivitiesByUserId(@Param("userId") Long userId, @Param("offset") int offset, @Param("limit") int limit);

    @Select("SELECT COUNT(*) FROM activity_join WHERE user_id = #{userId}")
    int countJoinedActivitiesByUserId(@Param("userId") Long userId);

    // ========== 点赞/收藏计数操作 ==========

    @Update("UPDATE activity SET like_count = like_count + 1 WHERE activity_id = #{activityId}")
    int incrementLikeCount(@Param("activityId") Long activityId);

    @Update("UPDATE activity SET like_count = like_count - 1 WHERE activity_id = #{activityId} AND like_count > 0")
    int decrementLikeCount(@Param("activityId") Long activityId);

    @Update("UPDATE activity SET collect_count = collect_count + 1 WHERE activity_id = #{activityId}")
    int incrementCollectCount(@Param("activityId") Long activityId);

    @Update("UPDATE activity SET collect_count = collect_count - 1 WHERE activity_id = #{activityId} AND collect_count > 0")
    int decrementCollectCount(@Param("activityId") Long activityId);
}
