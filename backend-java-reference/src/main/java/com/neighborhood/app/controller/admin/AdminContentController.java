package com.neighborhood.app.controller.admin;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.dto.admin.AdminContentRequests.CommentStatusRequest;
import com.neighborhood.app.dto.admin.AdminContentRequests.DynamicCommentRequest;
import com.neighborhood.app.dto.admin.AdminContentRequests.ImageStatusRequest;
import com.neighborhood.app.dto.admin.AdminCommonRequests.StatusRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminContentController {

    private final com.neighborhood.app.controller.admin.module.AdminContentModule module;

    @GetMapping("/dynamics")
    public Result<List<Map<String, Object>>> dynamics() {
        return module.dynamics();
    }

    @PostMapping("/dynamics/{id}/status")
    public Result<Void> updateDynamicStatus(@PathVariable Long id, @RequestBody StatusRequest body) {
        return module.updateDynamicStatus(id, body);
    }

    @PostMapping("/dynamics/{id}/comments")
    public Result<Void> addComment(@PathVariable Long id, @RequestBody DynamicCommentRequest body, @RequestAttribute String userId) {
        return module.addComment(id, body, userId);
    }

    @DeleteMapping("/dynamics/{id}/comments/{commentId}")
    public Result<Void> deleteDynamicComment(@PathVariable Long id, @PathVariable Long commentId) {
        return module.deleteDynamicComment(id, commentId);
    }

    @GetMapping("/comments")
    public Result<List<Map<String, Object>>> managedComments() {
        return module.managedComments();
    }

    @PostMapping("/comments/{id}/status")
    public Result<Void> updateCommentStatus(@PathVariable String id, @RequestBody CommentStatusRequest body) {
        return module.updateCommentStatus(id, body);
    }

    @DeleteMapping("/comments/{id}")
    public Result<Void> deleteComment(@PathVariable String id) {
        return module.deleteComment(id);
    }

    @GetMapping("/images")
    public Result<List<Map<String, Object>>> images() {
        return module.images();
    }

    @PostMapping("/images/{id}/status")
    public Result<Void> updateImageStatus(@PathVariable String id, @RequestBody ImageStatusRequest body) {
        return module.updateImageStatus(id, body);
    }

    @DeleteMapping("/images/{id}")
    public Result<Void> deleteImage(@PathVariable String id) {
        return module.deleteImage(id);
    }
}