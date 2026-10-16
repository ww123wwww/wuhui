package com.example.chufaya.service;

import com.example.chufaya.dto.ContentListResponse;
import com.example.chufaya.entity.Activity;
import com.example.chufaya.entity.ContentInfo;
import com.example.chufaya.entity.User;
import com.example.chufaya.mapper.CollectionMapper;
import com.example.chufaya.mapper.ContentInfoMapper;
import com.example.chufaya.mapper.LikeMapper;
import com.example.chufaya.mapper.UserFollowMapper;
import com.example.chufaya.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class ContentService {

    @Autowired
    private ContentInfoMapper contentInfoMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private LikeMapper likeMapper;

    @Autowired
    private CollectionMapper collectionMapper;

    @Autowired
    private UserFollowMapper userFollowMapper;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM. yyyy", java.util.Locale.ENGLISH);
    private static final String[] SAMPLE_IMAGES = {
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
        "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800",
        "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800",
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800"
    };
    private static final Random RANDOM = new Random();

    public ContentListResponse getContentList(Long userId, int page, int pageSize, String contentType, String location) {
        int offset = (page - 1) * pageSize;
        List<ContentInfo> contents;
        int total;
        
        if (location != null && !location.isEmpty()) {
            contents = contentInfoMapper.findByLocation(contentType, location, offset, pageSize);
            total = contentInfoMapper.countByLocation(contentType, location);
        } else if (contentType != null && !contentType.isEmpty()) {
            contents = contentInfoMapper.findByContentType(contentType, offset, pageSize);
            total = contentInfoMapper.countByContentType(contentType);
        } else {
            contents = contentInfoMapper.findAll(offset, pageSize);
            total = contentInfoMapper.countAll();
        }

        List<ContentListResponse.ContentItem> items = new ArrayList<>();
        for (int i = 0; i < contents.size(); i++) {
            ContentInfo content = contents.get(i);
            User author = userMapper.findById(content.getUserId());

            ContentListResponse.ContentItem item = new ContentListResponse.ContentItem();
            item.setId(content.getId());
            item.setImage(content.getCoverUrl() != null ? content.getCoverUrl() : SAMPLE_IMAGES[RANDOM.nextInt(SAMPLE_IMAGES.length)]);
            item.setTitle(content.getTitle());
            item.setLocation(content.getLocation() != null ? content.getLocation() : "");
            item.setLikes(String.valueOf(content.getLikeCount()));
            item.setLikeCount(content.getLikeCount());
            item.setImgHeight(280 + RANDOM.nextInt(200));
            item.setBadge(i == 0);
            item.setBadgeDate(content.getPublishTime() != null ? content.getPublishTime().format(DATE_FORMATTER) : "");
            item.setBadgeText(i == 0 ? "今日榜首" : "");
            item.setUserId(content.getUserId());
            item.setCoverUrl(content.getCoverUrl());
            item.setImageList(content.getImageList());
            String ct = content.getContentType() != null ? content.getContentType() : "note";
            item.setLiked(isLiked(userId, content.getId(), ct));

            if (author != null) {
                item.setAuthor(author.getNickname() + " · " + (content.getLocation() != null ? "我在" + content.getLocation() : "未知地点"));
                item.setAvatar(author.getAvatarUrl());
                item.setUsername(author.getNickname());
                item.setNickname(author.getNickname());
                item.setAvatarUrl(author.getAvatarUrl());
            }

            items.add(item);
        }

        return new ContentListResponse(items, total, page, pageSize);
    }

    public ContentListResponse getUserContentList(Long userId, int page, int pageSize) {
        int offset = (page - 1) * pageSize;
        List<ContentInfo> contents = contentInfoMapper.findByUserId(userId, offset, pageSize);
        int total = contentInfoMapper.countByUserId(userId);

        List<ContentListResponse.ContentItem> items = new ArrayList<>();
        for (ContentInfo content : contents) {
            User author = userMapper.findById(content.getUserId());

            ContentListResponse.ContentItem item = new ContentListResponse.ContentItem();
            item.setId(content.getId());
            item.setImage(content.getCoverUrl() != null ? content.getCoverUrl() : SAMPLE_IMAGES[RANDOM.nextInt(SAMPLE_IMAGES.length)]);
            item.setTitle(content.getTitle());
            item.setLocation(content.getLocation() != null ? content.getLocation() : "");
            item.setLikes(String.valueOf(content.getLikeCount()));
            item.setImgHeight(280 + RANDOM.nextInt(200));
            item.setUserId(content.getUserId());
            item.setCoverUrl(content.getCoverUrl());
            item.setImageList(content.getImageList());
            item.setLikeCount(content.getLikeCount());
            String ct = content.getContentType() != null ? content.getContentType() : "note";
            item.setLiked(isLiked(userId, content.getId(), ct));

            if (author != null) {
                item.setAuthor(author.getNickname());
                item.setAvatar(author.getAvatarUrl());
                item.setUsername(author.getNickname());
                item.setNickname(author.getNickname());
                item.setAvatarUrl(author.getAvatarUrl());
            }

            items.add(item);
        }

        return new ContentListResponse(items, total, page, pageSize);
    }

    public ContentInfo publishContent(Long userId, String contentType, String title, String content,
                                     String coverUrl, String imageList, String topicIds, String location) {
        ContentInfo contentInfo = new ContentInfo();
        contentInfo.setUserId(userId);
        contentInfo.setContentType(contentType);
        contentInfo.setTitle(title);
        contentInfo.setContent(content);
        contentInfo.setCoverUrl(coverUrl);
        contentInfo.setImageList(imageList);
        contentInfo.setTopicIds(topicIds);
        contentInfo.setLocation(location);
        contentInfo.setLikeCount(0);
        contentInfo.setCommentCount(0);
        contentInfo.setCollectCount(0);
        contentInfo.setStatus(1);
        contentInfo.setPublishTime(LocalDateTime.now());

        contentInfoMapper.insert(contentInfo);
        return contentInfo;
    }

    public ContentInfo getContentById(Long contentId) {
        ContentInfo content = contentInfoMapper.findById(contentId);
        if (content != null && content.getUserId() != null) {
            User user = userMapper.findById(content.getUserId());
            if (user != null) {
                content.setAvatarUrl(user.getAvatarUrl());
                content.setNickname(user.getNickname());
                content.setIpLocation(user.getIpLocation());
            }
        }
        return content;
    }

    @Transactional
    public LikeResult likeContent(Long userId, Long contentId, String contentType) {
        int count = likeMapper.countLike(userId, contentId, contentType);
        if (count > 0) {
            likeMapper.deleteLike(userId, contentId, contentType);
            contentInfoMapper.decrementLikeCount(contentId);
            return new LikeResult(false, "取消点赞成功");
        } else {
            likeMapper.insertLike(userId, contentId, contentType);
            contentInfoMapper.incrementLikeCount(contentId);
            return new LikeResult(true, "点赞成功");
        }
    }

    @Transactional
    public LikeResult collectContent(Long userId, Long contentId, String contentType) {
        int count = collectionMapper.countCollection(userId, contentId, contentType);
        if (count > 0) {
            collectionMapper.deleteCollection(userId, contentId, contentType);
            contentInfoMapper.decrementCollectCount(contentId);
            return new LikeResult(false, "取消收藏成功");
        } else {
            collectionMapper.insertCollection(userId, contentId, contentType);
            contentInfoMapper.incrementCollectCount(contentId);
            return new LikeResult(true, "收藏成功");
        }
    }

    public boolean isLiked(Long userId, Long contentId, String contentType) {
        return likeMapper.countLike(userId, contentId, contentType) > 0;
    }

    public boolean isCollected(Long userId, Long contentId, String contentType) {
        return collectionMapper.countCollection(userId, contentId, contentType) > 0;
    }

    public boolean isFollowing(Long followerId, Long followeeId) {
        return userFollowMapper.countFollow(followerId, followeeId) > 0;
    }

    public void deleteContent(Long userId, Long contentId) {
        ContentInfo content = contentInfoMapper.findById(contentId);
        if (content == null) {
            throw new RuntimeException("内容不存在");
        }
        if (!content.getUserId().equals(userId)) {
            throw new RuntimeException("无权删除该内容");
        }
        contentInfoMapper.updateStatus(contentId, 0);
    }

    public ContentListResponse getUserLikedList(Long userId, int page, int pageSize) {
        int offset = (page - 1) * pageSize;
        List<ContentInfo> contents = likeMapper.findLikedContents(userId, offset, pageSize);
        int totalContent = likeMapper.countLikedContents(userId);

        List<ContentListResponse.ContentItem> items = new ArrayList<>();
        for (ContentInfo content : contents) {
            User author = userMapper.findById(content.getUserId());

            ContentListResponse.ContentItem item = new ContentListResponse.ContentItem();
            item.setId(content.getId());
            item.setImage(content.getCoverUrl() != null ? content.getCoverUrl() : SAMPLE_IMAGES[RANDOM.nextInt(SAMPLE_IMAGES.length)]);
            item.setTitle(content.getTitle());
            item.setLocation(content.getLocation() != null ? content.getLocation() : "");
            item.setLikes(String.valueOf(content.getLikeCount()));
            item.setLikeCount(content.getLikeCount());
            item.setImgHeight(280 + RANDOM.nextInt(200));
            item.setUserId(content.getUserId());
            item.setCoverUrl(content.getCoverUrl());
            item.setImageList(content.getImageList());
            item.setLiked(true);
            item.setContentType(content.getContentType() != null ? content.getContentType() : "note");

            if (author != null) {
                item.setAuthor(author.getNickname());
                item.setAvatar(author.getAvatarUrl());
                item.setUsername(author.getNickname());
                item.setNickname(author.getNickname());
                item.setAvatarUrl(author.getAvatarUrl());
            }

            items.add(item);
        }

        // 查询活动类型的点赞
        List<Activity> activities = likeMapper.findLikedActivities(userId, offset, pageSize);
        int totalActivity = likeMapper.countLikedActivities(userId);

        for (Activity activity : activities) {
            ContentListResponse.ContentItem item = new ContentListResponse.ContentItem();
            item.setId(activity.getActivityId());
            item.setImage(activity.getCoverImg() != null ? activity.getCoverImg() : SAMPLE_IMAGES[RANDOM.nextInt(SAMPLE_IMAGES.length)]);
            item.setTitle(activity.getTitle());
            item.setLocation(activity.getAddress() != null ? activity.getAddress() : "");
            item.setLikes(String.valueOf(activity.getLikeCount()));
            item.setLikeCount(activity.getLikeCount());
            item.setImgHeight(280 + RANDOM.nextInt(200));
            item.setUserId(activity.getUserId());
            item.setCoverUrl(activity.getCoverImg());
            item.setLiked(true);
            item.setContentType("activity");

            if (activity.getNickname() != null) {
                item.setAuthor(activity.getNickname());
                item.setAvatar(activity.getAvatarUrl());
                item.setUsername(activity.getNickname());
                item.setNickname(activity.getNickname());
                item.setAvatarUrl(activity.getAvatarUrl());
            }

            items.add(item);
        }

        int total = totalContent + totalActivity;
        return new ContentListResponse(items, total, page, pageSize);
    }

    public ContentListResponse getUserCollectionList(Long userId, int page, int pageSize) {
        int offset = (page - 1) * pageSize;
        List<ContentInfo> contents = collectionMapper.findCollectedContents(userId, offset, pageSize);
        int totalContent = collectionMapper.countCollectedContents(userId);

        List<ContentListResponse.ContentItem> items = new ArrayList<>();
        for (ContentInfo content : contents) {
            User author = userMapper.findById(content.getUserId());

            ContentListResponse.ContentItem item = new ContentListResponse.ContentItem();
            item.setId(content.getId());
            item.setImage(content.getCoverUrl() != null ? content.getCoverUrl() : SAMPLE_IMAGES[RANDOM.nextInt(SAMPLE_IMAGES.length)]);
            item.setTitle(content.getTitle());
            item.setLocation(content.getLocation() != null ? content.getLocation() : "");
            item.setLikes(String.valueOf(content.getLikeCount()));
            item.setLikeCount(content.getLikeCount());
            item.setImgHeight(280 + RANDOM.nextInt(200));
            item.setUserId(content.getUserId());
            item.setCoverUrl(content.getCoverUrl());
            item.setImageList(content.getImageList());
            String ct2 = content.getContentType() != null ? content.getContentType() : "note";
            item.setLiked(isLiked(userId, content.getId(), ct2));
            item.setContentType(ct2);

            if (author != null) {
                item.setAuthor(author.getNickname());
                item.setAvatar(author.getAvatarUrl());
                item.setUsername(author.getNickname());
                item.setNickname(author.getNickname());
                item.setAvatarUrl(author.getAvatarUrl());
            }

            items.add(item);
        }

        // 查询活动类型的收藏
        List<Activity> activities = collectionMapper.findCollectedActivities(userId, offset, pageSize);
        int totalActivity = collectionMapper.countCollectedActivities(userId);

        for (Activity activity : activities) {
            ContentListResponse.ContentItem item = new ContentListResponse.ContentItem();
            item.setId(activity.getActivityId());
            item.setImage(activity.getCoverImg() != null ? activity.getCoverImg() : SAMPLE_IMAGES[RANDOM.nextInt(SAMPLE_IMAGES.length)]);
            item.setTitle(activity.getTitle());
            item.setLocation(activity.getAddress() != null ? activity.getAddress() : "");
            item.setLikes(String.valueOf(activity.getLikeCount()));
            item.setLikeCount(activity.getLikeCount());
            item.setImgHeight(280 + RANDOM.nextInt(200));
            item.setUserId(activity.getUserId());
            item.setCoverUrl(activity.getCoverImg());
            item.setLiked(isLiked(userId, activity.getActivityId(), "activity"));
            item.setContentType("activity");

            if (activity.getNickname() != null) {
                item.setAuthor(activity.getNickname());
                item.setAvatar(activity.getAvatarUrl());
                item.setUsername(activity.getNickname());
                item.setNickname(activity.getNickname());
                item.setAvatarUrl(activity.getAvatarUrl());
            }

            items.add(item);
        }

        int total = totalContent + totalActivity;
        return new ContentListResponse(items, total, page, pageSize);
    }

    public ContentListResponse searchContent(Long userId, String keyword, String contentType, int page, int pageSize) {
        int offset = (page - 1) * pageSize;
        List<ContentInfo> contents = contentInfoMapper.searchByKeyword(keyword, contentType, offset, pageSize);
        int total = contentInfoMapper.countByKeyword(keyword, contentType);

        List<ContentListResponse.ContentItem> items = new ArrayList<>();
        for (ContentInfo content : contents) {
            User author = userMapper.findById(content.getUserId());

            ContentListResponse.ContentItem item = new ContentListResponse.ContentItem();
            item.setId(content.getId());
            item.setImage(content.getCoverUrl() != null ? content.getCoverUrl() : SAMPLE_IMAGES[RANDOM.nextInt(SAMPLE_IMAGES.length)]);
            item.setTitle(content.getTitle());
            item.setLocation(content.getLocation() != null ? content.getLocation() : "");
            item.setLikes(String.valueOf(content.getLikeCount()));
            item.setLikeCount(content.getLikeCount());
            item.setImgHeight(280 + RANDOM.nextInt(200));
            item.setUserId(content.getUserId());
            item.setCoverUrl(content.getCoverUrl());
            item.setImageList(content.getImageList());
            item.setContentType(content.getContentType());
            if (userId != null) {
                String ct = content.getContentType() != null ? content.getContentType() : "note";
                item.setLiked(isLiked(userId, content.getId(), ct));
            }

            if (author != null) {
                item.setAuthor(author.getNickname());
                item.setAvatar(author.getAvatarUrl());
                item.setUsername(author.getNickname());
                item.setNickname(author.getNickname());
                item.setAvatarUrl(author.getAvatarUrl());
            }

            items.add(item);
        }

        return new ContentListResponse(items, total, page, pageSize);
    }

    public static class LikeResult {
        private boolean liked;
        private String message;

        public LikeResult(boolean liked, String message) {
            this.liked = liked;
            this.message = message;
        }

        public boolean isLiked() {
            return liked;
        }

        public String getMessage() {
            return message;
        }
    }
}