/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.vo;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.neighborhood.app.entity.Comment;
import com.neighborhood.app.entity.News;
import com.neighborhood.app.entity.User;
import lombok.Data;
import lombok.experimental.Accessors;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Accessors(chain = true)
public class NewsVO {
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    private String title;
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
    private String images;
    private Integer shares;
    private Integer collections;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private List<Comment> comments;
    // 当前用户是否点赞/收藏/关注
    private Boolean isLiked;
    private Boolean isFavorited;
    private Boolean isFollowing;
    // 解析出的标签
    private List<String> tags;

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

        // 解析内容中的 #话题# 标签
        if (news.getContent() != null) {
            java.util.List<String> tagList = new java.util.ArrayList<>();
            java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("#([^#]+)#").matcher(news.getContent());
            while (matcher.find()) {
                tagList.add(matcher.group(1));
            }
            vo.setTags(tagList);
        }
        return vo;
    }
}
