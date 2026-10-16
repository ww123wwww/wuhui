package com.example.chufaya.controller;

import com.example.chufaya.dto.ContentListResponse;
import com.example.chufaya.dto.ContentPublishRequest;
import com.example.chufaya.dto.UnifiedResponse;
import com.example.chufaya.entity.ContentInfo;
import com.example.chufaya.service.ContentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/content")
@CrossOrigin(origins = "*")
public class ContentController {

    @Autowired
    private ContentService contentService;

    @GetMapping("/list")
    public UnifiedResponse<ContentListResponse> getContentList(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String contentType,
            @RequestParam(required = false) String location) {
        try {
            ContentListResponse response = contentService.getContentList(userId, page, pageSize, contentType, location);
            return UnifiedResponse.success("获取内容列表成功", response);
        } catch (Exception e) {
            return UnifiedResponse.error("获取内容列表失败：" + e.getMessage());
        }
    }

    @GetMapping("/user/list")
    public UnifiedResponse<ContentListResponse> getUserContentList(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        try {
            ContentListResponse response = contentService.getUserContentList(userId, page, pageSize);
            return UnifiedResponse.success("获取用户内容列表成功", response);
        } catch (Exception e) {
            return UnifiedResponse.error("获取用户内容列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/detail")
    public UnifiedResponse<ContentDetailResponse> getContentDetail(
            @RequestParam Long id,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        try {
            ContentInfo content = contentService.getContentById(id);
            if (content != null) {
                ContentDetailResponse response = new ContentDetailResponse();
                response.setContent(content);
                String ct = content.getContentType() != null ? content.getContentType() : "note";
                response.setLiked(contentService.isLiked(userId, id, ct));
                response.setCollected(contentService.isCollected(userId, id, ct));
                response.setFollowing(contentService.isFollowing(userId, content.getUserId()));
                return UnifiedResponse.success("获取内容详情成功", response);
            } else {
                return UnifiedResponse.notFound("内容不存在");
            }
        } catch (Exception e) {
            return UnifiedResponse.error("获取内容详情失败: " + e.getMessage());
        }
    }

    public static class ContentDetailResponse {
        private ContentInfo content;
        private boolean liked;
        private boolean collected;
        private boolean following;

        public ContentInfo getContent() {
            return content;
        }

        public void setContent(ContentInfo content) {
            this.content = content;
        }

        public boolean isLiked() {
            return liked;
        }

        public void setLiked(boolean liked) {
            this.liked = liked;
        }

        public boolean isCollected() {
            return collected;
        }

        public void setCollected(boolean collected) {
            this.collected = collected;
        }

        public boolean isFollowing() {
            return following;
        }

        public void setFollowing(boolean following) {
            this.following = following;
        }
    }

    @PostMapping("/delete")
    public UnifiedResponse<String> deleteContent(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestBody DeleteContentRequest request) {
        try {
            contentService.deleteContent(userId, request.getContentId());
            return UnifiedResponse.success("删除成功", "success");
        } catch (Exception e) {
            return UnifiedResponse.error("删除失败: " + e.getMessage());
        }
    }

    @PostMapping("/publish")
    public UnifiedResponse<ContentInfo> publishContent(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestBody ContentPublishRequest request) {
        try {
            ContentInfo published = contentService.publishContent(userId, request.getContentType(),
                    request.getTitle(), request.getContent(), request.getCoverUrl(),
                    request.getImageList(), request.getTopicIds(), request.getLocation());
            return UnifiedResponse.success("发布成功", published);
        } catch (Exception e) {
            return UnifiedResponse.error("发布失败: " + e.getMessage());
        }
    }

    @PostMapping("/like")
    public UnifiedResponse<LikeResponse> likeContent(@RequestBody LikeRequest request) {
        try {
            Long userId = request.getUserId() != null ? request.getUserId() : 1L;
            String contentType = request.getContentType() != null ? request.getContentType() : "note";
            ContentService.LikeResult result = contentService.likeContent(userId, request.getContentId(), contentType);
            return UnifiedResponse.success(result.getMessage(), new LikeResponse(result.isLiked()));
        } catch (Exception e) {
            return UnifiedResponse.error("点赞失败: " + e.getMessage());
        }
    }

    @PostMapping("/collect")
    public UnifiedResponse<LikeResponse> collectContent(@RequestBody CollectRequest request) {
        try {
            Long userId = request.getUserId() != null ? request.getUserId() : 1L;
            String contentType = request.getContentType() != null ? request.getContentType() : "note";
            ContentService.LikeResult result = contentService.collectContent(userId, request.getContentId(), contentType);
            return UnifiedResponse.success(result.getMessage(), new LikeResponse(result.isLiked()));
        } catch (Exception e) {
            return UnifiedResponse.error("收藏失败: " + e.getMessage());
        }
    }

    @GetMapping("/likes")
    public UnifiedResponse<ContentListResponse> getUserLikedList(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        try {
            ContentListResponse response = contentService.getUserLikedList(userId, page, pageSize);
            return UnifiedResponse.success("获取赞过列表成功", response);
        } catch (Exception e) {
            return UnifiedResponse.error("获取赞过列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/collections")
    public UnifiedResponse<ContentListResponse> getUserCollectionList(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        try {
            ContentListResponse response = contentService.getUserCollectionList(userId, page, pageSize);
            return UnifiedResponse.success("获取收藏列表成功", response);
        } catch (Exception e) {
            return UnifiedResponse.error("获取收藏列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public UnifiedResponse<ContentListResponse> searchContent(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String contentType,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        try {
            ContentListResponse response = contentService.searchContent(userId, keyword, contentType, page, pageSize);
            return UnifiedResponse.success("搜索成功", response);
        } catch (Exception e) {
            return UnifiedResponse.error("搜索失败: " + e.getMessage());
        }
    }

    public static class LikeResponse {
        private boolean liked;

        public LikeResponse(boolean liked) {
            this.liked = liked;
        }

        public boolean isLiked() {
            return liked;
        }

        public void setLiked(boolean liked) {
            this.liked = liked;
        }
    }

    public static class LikeRequest {
        private Long userId;
        private Long contentId;
        private String contentType;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Long getContentId() { return contentId; }
        public void setContentId(Long contentId) { this.contentId = contentId; }
        public String getContentType() { return contentType; }
        public void setContentType(String contentType) { this.contentType = contentType; }
    }

    public static class CollectRequest {
        private Long userId;
        private Long contentId;
        private String contentType;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Long getContentId() { return contentId; }
        public void setContentId(Long contentId) { this.contentId = contentId; }
        public String getContentType() { return contentType; }
        public void setContentType(String contentType) { this.contentType = contentType; }
    }

    public static class DeleteContentRequest {
        private Long contentId;

        public Long getContentId() { return contentId; }
        public void setContentId(Long contentId) { this.contentId = contentId; }
    }
}
