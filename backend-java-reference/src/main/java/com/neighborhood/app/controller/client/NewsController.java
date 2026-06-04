package com.neighborhood.app.controller.client;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.dto.interaction.CommentRequest;
import com.neighborhood.app.entity.content.Comment;
import com.neighborhood.app.entity.content.News;
import com.neighborhood.app.service.CommentLikeService;
import com.neighborhood.app.service.NewsService;
import com.neighborhood.app.service.UserService;
import com.neighborhood.app.utils.RequestUserUtil;
import com.neighborhood.app.utils.RequestValueUtil;
import com.neighborhood.app.vo.content.NewsVO;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private static final String DEFAULT_CATEGORY = "生活记录";

    private final NewsService newsService;
    private final CommentLikeService commentLikeService;
    private final UserService userService;

    @GetMapping("/list")
    public Result<List<NewsVO>> list(HttpServletRequest request) {
        return Result.ok(newsService.listDescVO(RequestUserUtil.currentUserId(request)));
    }

    @GetMapping("/user/{userId}")
    public Result<List<NewsVO>> listByUserId(@PathVariable String userId) {
        return Result.ok(newsService.listByUserId(userId));
    }

    @PostMapping("/create")
    public Result<Boolean> create(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        News news = new News();
        news.setAuthorId(RequestUserUtil.currentUserId(request));
        news.setTitle(RequestValueUtil.str(body.get("title")));
        news.setContent(RequestValueUtil.str(body.get("content")));
        news.setLocation(RequestValueUtil.str(body.get("location")));
        news.setCategory(RequestValueUtil.str(body.get("category")));
        news.setImages(RequestValueUtil.normalizeJsonArray(body.get("images")));
        if (news.getCategory() == null || news.getCategory().isEmpty()) {
            news.setCategory(DEFAULT_CATEGORY);
        }
        return Result.ok(newsService.save(news));
    }

    @GetMapping("/{id}")
    public Result<NewsVO> getById(@PathVariable Long id, HttpServletRequest request) {
        return Result.ok(newsService.getNewsVOById(id, RequestUserUtil.currentUserId(request)));
    }

    @PostMapping("/{id}/like")
    public Result<Boolean> like(@PathVariable Long id, HttpServletRequest request) {
        String userId = RequestUserUtil.currentUserId(request);
        if (userId == null || userId.isBlank()) {
            return Result.fail("请先登录");
        }
        if (newsService.isLiked(id, userId)) {
            return Result.ok(newsService.unlike(id, userId));
        }
        return Result.ok(newsService.like(id, userId));
    }

    @PostMapping("/{id}/unlike")
    public Result<Boolean> unlike(@PathVariable Long id, HttpServletRequest request) {
        String userId = RequestUserUtil.currentUserId(request);
        if (userId == null || userId.isBlank()) {
            return Result.fail("请先登录");
        }
        return Result.ok(newsService.unlike(id, userId));
    }

    @GetMapping("/{id}/comments")
    public Result<List<Comment>> getComments(
            @PathVariable Long id,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(required = false) String userId,
            HttpServletRequest request) {
        return Result.ok(newsService.getCommentsByNewsId(
                id,
                limit,
                offset,
                RequestUserUtil.getEffectiveUserId(request, userId)
        ));
    }

    @PostMapping("/comment/{id}/like")
    public Result<Boolean> likeComment(
            @PathVariable Long id,
            @RequestParam(required = false) String userId,
            HttpServletRequest request) {
        String effectiveUserId = RequestUserUtil.currentUserId(request);
        if (effectiveUserId == null || effectiveUserId.isBlank()) {
            return Result.fail("请先登录");
        }
        Boolean liked = commentLikeService.toggleLike(id, effectiveUserId);
        if (liked == null) {
            return Result.fail("点赞失败");
        }
        return Result.ok(liked);
    }

    @PostMapping("/{id}/comment")
    public Result<Void> addComment(@PathVariable Long id, @RequestBody CommentRequest request, HttpServletRequest httpRequest) {
        String userId = RequestUserUtil.currentUserId(httpRequest);
        if (userId == null || userId.isBlank()) {
            return Result.fail("请先登录");
        }
        var user = userService.getById(userId);
        if (user == null) {
            return Result.fail("用户不存在");
        }
        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setUserId(user.getId());
        comment.setUserName(user.getName());
        comment.setUserAvatar(user.getAvatar());
        comment.setParentId(request.getParentId());
        newsService.addComment(id, comment);
        return Result.ok();
    }

    @GetMapping("/trending")
    public Result<List<NewsVO>> trending(@RequestParam(defaultValue = "5") int limit) {
        return Result.ok(newsService.listTrending(limit));
    }

    @PostMapping("/{id}/delete")
    public Result<Boolean> delete(@PathVariable Long id, HttpServletRequest request) {
        return Result.ok(newsService.deleteById(id, RequestUserUtil.currentUserId(request)));
    }
}
