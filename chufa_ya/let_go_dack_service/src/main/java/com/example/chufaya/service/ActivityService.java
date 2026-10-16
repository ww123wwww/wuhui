package com.example.chufaya.service;

import com.example.chufaya.entity.Activity;
import com.example.chufaya.mapper.ActivityMapper;
import com.example.chufaya.mapper.LikeMapper;
import com.example.chufaya.mapper.CollectionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ActivityService {

    @Autowired
    private ActivityMapper activityMapper;

    @Autowired
    private LikeMapper likeMapper;

    @Autowired
    private CollectionMapper collectionMapper;

    /**
     * 获取活动列表（分页）
     */
    public Map<String, Object> getActivityList(int page, int size) {
        int offset = (page - 1) * size;
        List<Activity> list = activityMapper.findAll(offset, size);
        int total = activityMapper.countAll();

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    /**
     * 获取活动列表（分页，带已加入状态）
     */
    public Map<String, Object> getActivityListWithJoinStatus(Long userId, int page, int size) {
        int offset = (page - 1) * size;
        List<Activity> list = activityMapper.findAllWithJoinStatus(userId, offset, size);
        int total = activityMapper.countAll();

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    /**
     * 获取活动详情
     */
    public Activity getActivityDetail(Long activityId) {
        return activityMapper.findById(activityId);
    }

    /**
     * 发布新活动
     */
    public Activity publishActivity(Activity activity) {
        // 设置默认值
        activity.setJoinNum(0);
        activity.setStatus(0); // 招募中

        int rows = activityMapper.insert(activity);
        if (rows > 0) {
            return activityMapper.findById(activity.getActivityId());
        }
        return null;
    }

    /**
     * 加入活动
     * @return 0-成功 1-活动不存在 2-已满员 3-不能加入自己发布的活动 4-已经加入过
     */
    @Transactional
    public int joinActivity(Long activityId, Long userId) {
        Activity activity = activityMapper.findById(activityId);
        if (activity == null) {
            return 1; // 活动不存在
        }

        if (activity.getStatus() == 1 || activity.getJoinNum() >= activity.getTotalNum()) {
            return 2; // 已满员
        }

        // 不能加入自己发布的活动
        if (activity.getUserId().equals(userId)) {
            return 3;
        }

        // 检查是否已经加入过
        int joinCount = activityMapper.countActivityJoin(activityId, userId);
        if (joinCount > 0) {
            return 4; // 已经加入过
        }

        // 记录用户加入关系
        activityMapper.insertActivityJoin(activityId, userId);

        // 更新已报名人数
        int rows = activityMapper.incrementJoinNum(activityId);
        if (rows > 0) {
            // 检查是否满员，更新状态
            Activity updated = activityMapper.findById(activityId);
            if (updated != null && updated.getJoinNum() >= updated.getTotalNum()) {
                activityMapper.updateStatus(activityId, 1); // 已满员
            }
            return 0; // 成功
        }
        return 1;
    }

    /**
     * 退出活动
     * @return 0-成功 1-活动不存在 2-未加入过该活动
     */
    @Transactional
    public int quitActivity(Long activityId, Long userId) {
        Activity activity = activityMapper.findById(activityId);
        if (activity == null) {
            return 1; // 活动不存在
        }

        // 检查是否已加入
        int joinCount = activityMapper.countActivityJoin(activityId, userId);
        if (joinCount == 0) {
            return 2; // 未加入过该活动
        }

        // 删除用户加入关系
        activityMapper.deleteActivityJoin(activityId, userId);

        // 减少已报名人数
        activityMapper.decrementJoinNum(activityId);

        // 如果之前是满员状态，现在改为招募中
        if (activity.getStatus() == 1) {
            activityMapper.updateStatus(activityId, 0); // 招募中
        }

        return 0; // 成功
    }

    /**
     * 检查用户是否已加入活动
     */
    public boolean isJoinedActivity(Long activityId, Long userId) {
        return activityMapper.countActivityJoin(activityId, userId) > 0;
    }

    /**
     * 获取用户已加入的活动列表
     */
    public Map<String, Object> getJoinedActivities(Long userId, int page, int size) {
        int offset = (page - 1) * size;
        List<Activity> list = activityMapper.findJoinedActivitiesByUserId(userId, offset, size);
        int total = activityMapper.countJoinedActivitiesByUserId(userId);

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    /**
     * 搜索活动（关键词匹配标题或目的地）
     */
    public Map<String, Object> searchActivities(String keyword, int page, int size) {
        int offset = (page - 1) * size;
        List<Activity> list = activityMapper.searchByKeyword(keyword, offset, size);
        int total = activityMapper.countByKeyword(keyword);

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    /**
     * 搜索活动（带已加入状态）
     */
    public Map<String, Object> searchActivitiesWithJoinStatus(String keyword, Long userId, int page, int size) {
        int offset = (page - 1) * size;
        List<Activity> list = activityMapper.searchByKeywordWithJoinStatus(keyword, userId, offset, size);
        int total = activityMapper.countByKeyword(keyword);

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    /**
     * 检查用户是否已点赞活动
     */
    public boolean isLikedActivity(Long activityId, Long userId) {
        return likeMapper.countLike(userId, activityId, "activity") > 0;
    }

    /**
     * 检查用户是否已收藏活动
     */
    public boolean isCollectedActivity(Long activityId, Long userId) {
        return collectionMapper.countCollection(userId, activityId, "activity") > 0;
    }

    /**
     * 点赞/取消点赞活动
     * @return true-点赞 false-取消点赞
     */
    @Transactional
    public boolean likeActivity(Long activityId, Long userId) {
        int count = likeMapper.countLike(userId, activityId, "activity");
        if (count > 0) {
            // 取消点赞
            likeMapper.deleteLike(userId, activityId, "activity");
            activityMapper.decrementLikeCount(activityId);
            return false;
        } else {
            // 点赞
            likeMapper.insertLike(userId, activityId, "activity");
            activityMapper.incrementLikeCount(activityId);
            return true;
        }
    }

    /**
     * 收藏/取消收藏活动
     * @return true-收藏 false-取消收藏
     */
    @Transactional
    public boolean collectActivity(Long activityId, Long userId) {
        int count = collectionMapper.countCollection(userId, activityId, "activity");
        if (count > 0) {
            // 取消收藏
            collectionMapper.deleteCollection(userId, activityId, "activity");
            activityMapper.decrementCollectCount(activityId);
            return false;
        } else {
            // 收藏
            collectionMapper.insertCollection(userId, activityId, "activity");
            activityMapper.incrementCollectCount(activityId);
            return true;
        }
    }
}
