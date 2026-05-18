/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity;

import lombok.Data;

@Data
public class UserVO {
    private String id;
    private String name;
    private String email;
    private String avatar;
    private String tag;
    private Boolean isVerified;
    private Integer followersCount;
    private Integer followingCount;

    public static UserVO fromUser(User user) {
        UserVO vo = new UserVO();
        vo.setId(user.getId());
        vo.setName(user.getName());
        vo.setEmail(user.getEmail());
        vo.setAvatar(user.getAvatar());
        vo.setTag(user.getTag());
        vo.setIsVerified(user.getIsVerified());
        vo.setFollowersCount(user.getFollowersCount());
        vo.setFollowingCount(user.getFollowingCount());
        return vo;
    }
}
