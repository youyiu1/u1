/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.vo;

import com.neighborhood.app.entity.User;
import lombok.Data;

@Data
public class UserVO {
    private String id;
    private String name;
    private String email;
    private String avatar;
    private String tag;
    private String bio;
    private Boolean isVerified;
    private Integer followersCount;
    private Integer followingCount;
    private String profileVisible = "public";
    private String postsVisible = "public";
    private Boolean showLocation = true;

    public static UserVO fromUser(User user) {
        UserVO vo = new UserVO();
        vo.setId(user.getId());
        vo.setName(user.getName());
        vo.setEmail(user.getEmail());
        vo.setAvatar(user.getAvatar());
        vo.setTag(user.getTag());
        vo.setBio(user.getBio());
        vo.setIsVerified(user.getIsVerified());
        vo.setFollowersCount(user.getFollowersCount());
        vo.setFollowingCount(user.getFollowingCount());
        vo.setProfileVisible(user.getProfileVisible() != null ? user.getProfileVisible() : "public");
        vo.setPostsVisible(user.getPostsVisible() != null ? user.getPostsVisible() : "public");
        vo.setShowLocation(user.getShowLocation() != null ? user.getShowLocation() : true);
        return vo;
    }
}

