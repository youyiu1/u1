package com.neighborhood.app.service;

/** 安全限流服务接口。 */
public interface SecurityRateLimitService {

    void checkUserLogin(String clientKey, String account);

    void recordUserLoginSuccess(String clientKey, String account);

    void recordUserLoginFailure(String clientKey, String account);

    void checkAdminLogin(String clientKey, String account);

    void recordAdminLoginSuccess(String clientKey, String account);

    void recordAdminLoginFailure(String clientKey, String account);

    void checkEmailSend(String clientKey, String email);

    void recordEmailSend(String clientKey, String email);

    void checkResetPassword(String clientKey, String email);

    void recordResetPasswordFailure(String clientKey, String email);

    void recordResetPasswordSuccess(String clientKey, String email);

    void checkEmailCodeVerify(String email);

    void recordEmailCodeVerifyFailure(String email);

    void recordEmailCodeVerifySuccess(String email);
}
