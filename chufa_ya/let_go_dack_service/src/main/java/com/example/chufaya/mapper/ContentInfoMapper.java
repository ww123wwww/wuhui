package com.example.chufaya.mapper;

import com.example.chufaya.entity.ContentInfo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ContentInfoMapper {
    ContentInfo findById(@Param("id") Long id);

    List<ContentInfo> findAll(@Param("offset") int offset, @Param("limit") int limit);

    int countAll();

    List<ContentInfo> findByUserId(@Param("userId") Long userId, @Param("offset") int offset, @Param("limit") int limit);

    int countByUserId(@Param("userId") Long userId);

    List<ContentInfo> findByContentType(@Param("contentType") String contentType, @Param("offset") int offset, @Param("limit") int limit);

    int countByContentType(@Param("contentType") String contentType);

    List<ContentInfo> findByLocation(@Param("contentType") String contentType, @Param("location") String location, @Param("offset") int offset, @Param("limit") int limit);

    int countByLocation(@Param("contentType") String contentType, @Param("location") String location);

    int insert(ContentInfo contentInfo);

    int update(ContentInfo contentInfo);

    int incrementLikeCount(@Param("id") Long id);

    int decrementLikeCount(@Param("id") Long id);

    int incrementCommentCount(@Param("id") Long id);

    int incrementCollectCount(@Param("id") Long id);

    int decrementCollectCount(@Param("id") Long id);

    List<ContentInfo> searchByKeyword(@Param("keyword") String keyword, @Param("contentType") String contentType, @Param("offset") int offset, @Param("limit") int limit);

    int countByKeyword(@Param("keyword") String keyword, @Param("contentType") String contentType);

    int updateStatus(@Param("id") Long id, @Param("status") Integer status);
}