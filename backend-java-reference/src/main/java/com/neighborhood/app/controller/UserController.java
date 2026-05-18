/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.neighborhood.app.entity.User;
import com.neighborhood.app.service.UserService;
import com.neighborhood.app.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public Result<User> getById(@PathVariable String id) {
        return Result.ok(userService.getById(id));
    }

    @PostMapping("/register")
    public Result<User> register(@RequestBody User user) {
        User registered = userService.register(user.getName(), user.getEmail(), user.getPassword());
        return Result.ok(registered);
    }

    @PostMapping("/login")
    public Result<User> login(@RequestBody User user) {
        User loggedIn = userService.login(user.getEmail(), user.getPassword());
        return loggedIn != null ? Result.ok(loggedIn) : Result.fail("Invalid email or password");
    }

    @PostMapping("/follow")
    public Result<Boolean> follow(@RequestBody FollowRequest request) {
        boolean success = userService.follow(request.getFollowerId(), request.getFollowingId());
        return Result.ok(success);
    }

    @PostMapping("/unfollow")
    public Result<Boolean> unfollow(@RequestBody FollowRequest request) {
        boolean success = userService.unfollow(request.getFollowerId(), request.getFollowingId());
        return Result.ok(success);
    }

    @GetMapping("/isfollowing")
    public Result<Boolean> isFollowing(@RequestParam String followerId, @RequestParam String followingId) {
        return Result.ok(userService.isFollowing(followerId, followingId));
    }

    @PostMapping("/update")
    public Result<Boolean> update(@RequestBody User user) {
        return Result.ok(userService.updateById(user));
    }

    public static class FollowRequest {
        private String followerId;
        private String followingId;

        public String getFollowerId() { return followerId; }
        public void setFollowerId(String followerId) { this.followerId = followerId; }
        public String getFollowingId() { return followingId; }
        public void setFollowingId(String followingId) { this.followingId = followingId; }
    }
}