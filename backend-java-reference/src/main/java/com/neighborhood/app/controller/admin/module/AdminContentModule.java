package com.neighborhood.app.controller.admin.module;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.neighborhood.app.common.Result;
import com.neighborhood.app.controller.admin.AdminSupport;
import com.neighborhood.app.dto.admin.AdminContentRequests.CommentStatusRequest;
import com.neighborhood.app.dto.admin.AdminContentRequests.DynamicCommentRequest;
import com.neighborhood.app.dto.admin.AdminContentRequests.ImageDeleteRequest;
import com.neighborhood.app.dto.admin.AdminContentRequests.ImageStatusRequest;
import com.neighborhood.app.dto.admin.AdminCommonRequests.StatusRequest;
import com.neighborhood.app.entity.content.Comment;
import com.neighborhood.app.entity.content.News;
import com.neighborhood.app.entity.service.ServiceReview;
import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.mapper.content.CommentMapper;
import com.neighborhood.app.mapper.service.ServiceReviewMapper;
import com.neighborhood.app.service.AdminImageStatusService;
import com.neighborhood.app.service.NewsService;
import com.neighborhood.app.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class AdminContentModule {

    private final AdminSupport support;
    private final JdbcTemplate jdbcTemplate;
    private final NewsService newsService;
    private final UserService userService;
    private final CommentMapper commentMapper;
    private final ServiceReviewMapper serviceReviewMapper;
    private final AdminImageStatusService adminImageStatusService;

    public Result<List<Map<String, Object>>> dynamics() {
        String sql = """
                SELECT n.*, u.name author_name, u.avatar author_avatar, u.tag author_tag, u.is_verified author_verified
                FROM t_news n LEFT JOIN t_user u ON n.author_id = u.id
                ORDER BY n.create_time DESC
                """;
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
        Map<Long, List<Map<String, Object>>> commentsByNews = support.commentsForNewsBatch(
                rows.stream().map(row -> support.longVal(row.get("id"))).filter(id -> id > 0).toList()
        );
        return Result.ok(rows.stream().map(row -> {
            Long id = support.longVal(row.get("id"));
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", support.str(id));
            item.put("title", support.emptyTo(support.str(row.get("title")), support.firstText(support.str(row.get("content")))));
            item.put("author", support.emptyTo(support.str(row.get("author_name")), "未知用户"));
            item.put("authorAvatar", support.str(row.get("author_avatar")));
            item.put("authorTag", support.str(row.get("author_tag")));
            item.put("category", support.normalizeDynamicCategory(support.str(row.get("category"))));
            item.put("time", support.time(row.get("create_time")));
            item.put("images", support.parseImages(row.get("images")));
            item.put("status", support.emptyTo(support.str(row.get("status")), "normal"));
            item.put("likes", support.num(row.get("likes")));
            item.put("commentsCount", support.num(row.get("comments_count")));
            item.put("comments", commentsByNews.getOrDefault(id, List.of()));
            item.put("rejectReason", support.str(row.get("reject_reason")));
            item.put("userId", support.str(row.get("author_id")));
            item.put("verifiedUser", support.bool(row.get("author_verified")));
            return item;
        }).toList());
    }

    public Result<Void> updateDynamicStatus(Long id, StatusRequest body) {
        News news = newsService.getById(id);
        if (news == null) {
            return Result.fail("动态不存在");
        }
        news.setStatus(support.requestStatus(body, "normal"));
        news.setRejectReason(support.requestRejectReason(body));
        newsService.updateById(news);
        support.evictNewsRelated(id);
        return Result.ok();
    }

    public Result<Void> addComment(Long id, DynamicCommentRequest body, String userId) {
        User user = userService.getById(userId);
        String name = support.emptyTo(body == null ? null : body.commenter(), user == null ? "管理员" : user.getName());
        String avatar = user == null ? "" : user.getAvatar();
        Comment comment = new Comment();
        comment.setParentId(0L);
        comment.setUserId(userId);
        comment.setUserName(name);
        comment.setUserAvatar(avatar);
        comment.setContent(body == null ? "" : support.empty(body.text()));
        comment.setLikes(0);
        newsService.addComment(id, comment);
        support.recalcNewsCommentCount(id);
        return Result.ok();
    }

    public Result<Void> deleteDynamicComment(Long id, Long commentId) {
        Comment comment = commentMapper.selectById(commentId);
        if (comment != null && Objects.equals(comment.getNewsId(), id)) {
            commentMapper.deleteById(commentId);
            support.recalcNewsCommentCount(id);
            support.evictNewsRelated(id);
        }
        return Result.ok();
    }

    public Result<List<Map<String, Object>>> managedComments() {
        String sql = """
                SELECT c.*, n.title target_title, u.tag author_tag
                FROM t_comment c
                LEFT JOIN t_news n ON c.news_id = n.id
                LEFT JOIN t_user u ON c.user_id COLLATE utf8mb4_unicode_ci = u.id
                ORDER BY c.create_time DESC
                """;
        List<Map<String, Object>> comments = new ArrayList<>(jdbcTemplate.queryForList(sql).stream()
                .map(row -> managedCommentItem(
                        support.str(row.get("id")),
                        "dynamic",
                        row.get("news_id"),
                        row,
                        "动态评论"
                ))
                .toList());
        try {
            String reviewSql = """
                    SELECT r.*, s.title target_title, u.tag author_tag
                    FROM t_service_review r
                    LEFT JOIN t_service s ON r.service_id = s.id
                    LEFT JOIN t_user u ON r.user_id COLLATE utf8mb4_unicode_ci = u.id
                    ORDER BY r.create_time DESC
                    """;
            comments.addAll(jdbcTemplate.queryForList(reviewSql).stream()
                    .map(row -> managedCommentItem(
                            "service-" + support.str(row.get("id")),
                            "service",
                            row.get("service_id"),
                            row,
                            "服务评价"
                    ))
                    .toList());
        } catch (Exception ignored) {
        }
        comments.sort((a, b) -> support.str(b.get("time")).compareTo(support.str(a.get("time"))));
        return Result.ok(comments);
    }

    public Result<Void> updateCommentStatus(String id, CommentStatusRequest body) {
        String status = body == null ? "normal" : support.emptyTo(body.status(), "normal");
        if (id.startsWith("service-")) {
            Long reviewId = support.longVal(id.substring("service-".length()));
            Long serviceId = support.queryLong("SELECT service_id FROM t_service_review WHERE id = ?", reviewId);
            serviceReviewMapper.update(
                    null,
                    new LambdaUpdateWrapper<ServiceReview>()
                            .eq(ServiceReview::getId, reviewId)
                            .set(ServiceReview::getStatus, status)
            );
            support.recalcServiceReviewStats(serviceId);
            support.evictServiceRelated(serviceId);
        } else {
            Long commentId = support.longVal(id);
            Long newsId = support.queryLong("SELECT news_id FROM t_comment WHERE id = ?", commentId);
            commentMapper.update(
                    null,
                    new LambdaUpdateWrapper<Comment>()
                            .eq(Comment::getId, commentId)
                            .set(Comment::getStatus, status)
            );
            support.recalcNewsCommentCount(newsId);
            support.evictNewsRelated(newsId);
        }
        return Result.ok();
    }

    public Result<Void> deleteComment(String id) {
        if (id.startsWith("service-")) {
            Long reviewId = support.longVal(id.substring("service-".length()));
            Long serviceId = support.queryLong("SELECT service_id FROM t_service_review WHERE id = ?", reviewId);
            serviceReviewMapper.deleteById(reviewId);
            support.recalcServiceReviewStats(serviceId);
            support.evictServiceRelated(serviceId);
        } else {
            Long commentId = support.longVal(id);
            Long newsId = support.queryLong("SELECT news_id FROM t_comment WHERE id = ?", commentId);
            commentMapper.deleteById(commentId);
            support.recalcNewsCommentCount(newsId);
            support.evictNewsRelated(newsId);
        }
        return Result.ok();
    }

    public Result<List<Map<String, Object>>> images() {
        Map<String, Map<String, Object>> images = new LinkedHashMap<>();
        support.collectImages(images, "dynamic", "SELECT n.id, n.images, u.name uploader, u.tag uploader_tag, n.create_time FROM t_news n LEFT JOIN t_user u ON n.author_id=u.id");
        support.collectImages(images, "goods", "SELECT m.id, m.images, u.name uploader, u.tag uploader_tag, m.created_at create_time FROM t_market_item m LEFT JOIN t_user u ON m.seller_id=u.id");
        support.collectImages(images, "banner", "SELECT s.id, s.images, u.name uploader, u.tag uploader_tag, s.created_at create_time FROM t_service s LEFT JOIN t_user u ON s.seller_id=u.id");
        return Result.ok(new ArrayList<>(images.values()));
    }

    public Result<Void> updateImageStatus(ImageStatusRequest body) {
        String imageUrl = body == null ? "" : support.empty(body.imageUrl());
        if (imageUrl.isBlank()) {
            return Result.fail("图片地址不能为空");
        }
        adminImageStatusService.saveStatus(imageUrl, support.emptyTo(body.status(), "approved"));
        return Result.ok();
    }

    public Result<Void> deleteImage(ImageDeleteRequest body) {
        String imageUrl = body == null ? "" : support.empty(body.imageUrl());
        if (imageUrl.isBlank()) {
            return Result.fail("图片地址不能为空");
        }
        adminImageStatusService.deleteStatus(imageUrl);
        return Result.ok();
    }

    private Map<String, Object> managedCommentItem(String id, String targetType, Object targetId, Map<String, Object> row, String fallbackTitle) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", id);
        item.put("targetType", targetType);
        item.put("targetId", support.str(targetId));
        item.put("targetTitle", support.emptyTo(support.str(row.get("target_title")), fallbackTitle));
        item.put("authorName", support.str(row.get("user_name")));
        item.put("authorTag", support.str(row.get("author_tag")));
        item.put("authorAvatar", support.str(row.get("user_avatar")));
        item.put("content", support.str(row.get("content")));
        item.put("time", support.time(row.get("create_time")));
        item.put("status", support.emptyTo(support.str(row.get("status")), "normal"));
        return item;
    }
}
