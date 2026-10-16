package com.example.chufaya.dto;

import java.util.List;

public class ContentListResponse {
    private List<ContentItem> contents;
    private List<ContentItem> list;
    private Integer total;
    private Integer page;
    private Integer pageSize;

    public ContentListResponse() {
    }

    public ContentListResponse(List<ContentItem> contents, Integer total, Integer page, Integer pageSize) {
        this.contents = contents;
        this.list = contents;
        this.total = total;
        this.page = page;
        this.pageSize = pageSize;
    }

    public List<ContentItem> getContents() {
        return contents;
    }

    public void setContents(List<ContentItem> contents) {
        this.contents = contents;
        this.list = contents;
    }

    public List<ContentItem> getList() {
        return list;
    }

    public void setList(List<ContentItem> list) {
        this.list = list;
        this.contents = list;
    }

    public Integer getTotal() {
        return total;
    }

    public void setTotal(Integer total) {
        this.total = total;
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getPageSize() {
        return pageSize;
    }

    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize;
    }

    public static class ContentItem {
        private Long id;
        private String image;
        private String title;
        private String author;
        private String location;
        private String avatar;
        private String username;
        private String likes;
        private Integer imgHeight;
        private boolean badge;
        private String badgeDate;
        private String badgeText;
        private Long userId;
        private String coverUrl;
        private String imageList;
        private Integer likeCount;
        private String nickname;
        private String avatarUrl;
        private boolean liked;
        private String contentType;

        public ContentItem() {
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getImage() {
            return image;
        }

        public void setImage(String image) {
            this.image = image;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getAuthor() {
            return author;
        }

        public void setAuthor(String author) {
            this.author = author;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public String getAvatar() {
            return avatar;
        }

        public void setAvatar(String avatar) {
            this.avatar = avatar;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getLikes() {
            return likes;
        }

        public void setLikes(String likes) {
            this.likes = likes;
        }

        public Integer getImgHeight() {
            return imgHeight;
        }

        public void setImgHeight(Integer imgHeight) {
            this.imgHeight = imgHeight;
        }

        public boolean isBadge() {
            return badge;
        }

        public void setBadge(boolean badge) {
            this.badge = badge;
        }

        public String getBadgeDate() {
            return badgeDate;
        }

        public void setBadgeDate(String badgeDate) {
            this.badgeDate = badgeDate;
        }

        public String getBadgeText() {
            return badgeText;
        }

        public void setBadgeText(String badgeText) {
            this.badgeText = badgeText;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getCoverUrl() {
            return coverUrl;
        }

        public void setCoverUrl(String coverUrl) {
            this.coverUrl = coverUrl;
        }

        public String getImageList() {
            return imageList;
        }

        public void setImageList(String imageList) {
            this.imageList = imageList;
        }

        public Integer getLikeCount() {
            return likeCount;
        }

        public void setLikeCount(Integer likeCount) {
            this.likeCount = likeCount;
        }

        public String getNickname() {
            return nickname;
        }

        public void setNickname(String nickname) {
            this.nickname = nickname;
        }

        public String getAvatarUrl() {
            return avatarUrl;
        }

        public void setAvatarUrl(String avatarUrl) {
            this.avatarUrl = avatarUrl;
        }

        public boolean isLiked() {
            return liked;
        }

        public void setLiked(boolean liked) {
            this.liked = liked;
        }

        public String getContentType() {
            return contentType;
        }

        public void setContentType(String contentType) {
            this.contentType = contentType;
        }
    }
}