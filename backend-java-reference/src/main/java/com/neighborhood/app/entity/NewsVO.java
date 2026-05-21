/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import lombok.experimental.Accessors;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Accessors(chain = true)
public class NewsVO {
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    private String title;      // 标题
    private String authorId;
    private String authorName;
    private String authorAvatar;
    private String authorTag;
    private Boolean authorVerified;
    private Integer authorFollowersCount;
    private String content;
    private String location;
    private String category;
    private Integer likes;
    private Integer commentsCount;
    private List<String> images;
    private Integer shares;
    private Integer collections;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    public static NewsVO fromNews(News news, User author) {
        NewsVO vo = new NewsVO();
        vo.setId(news.getId());
        vo.setTitle(news.getTitle());
        vo.setAuthorId(news.getAuthorId());
        vo.setContent(news.getContent());
        vo.setLocation(news.getLocation());
        vo.setCategory(news.getCategory());
        vo.setLikes(news.getLikes());
        vo.setCommentsCount(news.getCommentsCount());
        vo.setImages(news.getImages());
        vo.setShares(news.getShares());
        vo.setCollections(news.getCollections());
        vo.setCreateTime(news.getCreateTime());
        vo.setUpdateTime(news.getUpdateTime());

        if (author != null) {
            vo.setAuthorName(author.getName());
            vo.setAuthorAvatar(author.getAvatar());
            vo.setAuthorTag(author.getTag());
            vo.setAuthorVerified(author.getIsVerified());
            vo.setAuthorFollowersCount(author.getFollowersCount());
        }
        return vo;
    }
}