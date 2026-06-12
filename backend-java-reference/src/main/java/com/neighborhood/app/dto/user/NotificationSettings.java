package com.neighborhood.app.dto.user;

import lombok.Data;

/** 文件作用：通知设置参数。 */
@Data
public class NotificationSettings {
    private Boolean pushEnabled;
    private Boolean messageNotify;
    private Boolean followNotify;
    private Boolean likeNotify;
    private Boolean commentNotify;
    private Boolean systemNotify;
}
