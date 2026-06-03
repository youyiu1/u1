package com.neighborhood.app.vo.user;

import com.neighborhood.app.entity.user.User;
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
    private String phone;
    private String region;
    private String status;
    private Boolean pushEnabled;
    private Boolean messageNotify;
    private Boolean followNotify;
    private Boolean likeNotify;
    private Boolean commentNotify;
    private Boolean systemNotify;
    private String profileVisible = "public";
    private String postsVisible = "public";
    private Boolean showLocation = true;
    private String createdAt;

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
        vo.setPhone(user.getPhone());
        vo.setRegion(user.getRegion());
        vo.setStatus(user.getStatus());
        vo.setPushEnabled(user.getPushEnabled() != null ? user.getPushEnabled() : true);
        vo.setMessageNotify(user.getMessageNotify() != null ? user.getMessageNotify() : true);
        vo.setFollowNotify(user.getFollowNotify() != null ? user.getFollowNotify() : true);
        vo.setLikeNotify(user.getLikeNotify() != null ? user.getLikeNotify() : true);
        vo.setCommentNotify(user.getCommentNotify() != null ? user.getCommentNotify() : true);
        vo.setSystemNotify(user.getSystemNotify() != null ? user.getSystemNotify() : false);
        vo.setProfileVisible(user.getProfileVisible() != null ? user.getProfileVisible() : "public");
        vo.setPostsVisible(user.getPostsVisible() != null ? user.getPostsVisible() : "public");
        vo.setShowLocation(user.getShowLocation() != null ? user.getShowLocation() : true);
        vo.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString().replace('T', ' ') : "");
        return vo;
    }
}
