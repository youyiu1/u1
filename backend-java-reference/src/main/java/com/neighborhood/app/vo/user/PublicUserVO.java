package com.neighborhood.app.vo.user;

import com.neighborhood.app.entity.user.User;
import lombok.Data;

@Data
public class PublicUserVO {
    private String id;
    private String name;
    private String avatar;
    private String tag;
    private String bio;
    private Boolean isVerified;
    private Integer followersCount;
    private Integer followingCount;
    private String region;

    public static PublicUserVO fromUser(User user) {
        PublicUserVO vo = new PublicUserVO();
        vo.setId(user.getId());
        vo.setName(user.getName());
        vo.setAvatar(user.getAvatar());
        vo.setTag(user.getTag());
        vo.setBio(user.getBio());
        vo.setIsVerified(user.getIsVerified());
        vo.setFollowersCount(user.getFollowersCount());
        vo.setFollowingCount(user.getFollowingCount());
        vo.setRegion(user.getRegion());
        return vo;
    }
}
