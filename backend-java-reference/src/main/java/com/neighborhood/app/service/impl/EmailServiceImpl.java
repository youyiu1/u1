/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.neighborhood.app.service.EmailService;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.util.Properties;
import java.util.Random;
import java.util.concurrent.TimeUnit;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/** 邮件服务实现 */
@Slf4j
@Service
public class EmailServiceImpl implements EmailService {

    private static final String CODE_PREFIX = "email:code:";
    private static final long CODE_TTL = 5;
    private static final Random RANDOM = new Random();
    private static final String EMAIL_SEND_FAILED_MESSAGE = "验证码发送失败，请检查邮箱服务配置";
    private static final String EMAIL_CONFIG_MISSING_MESSAGE = "邮箱服务未配置，请先检查邮箱账号和授权码";

    private final StringRedisTemplate stringRedisTemplate;

    @Value("${spring.mail.username:}")
    private String username;

    @Value("${spring.mail.password:}")
    private String password;

    @Value("${spring.mail.host:smtp.qq.com}")
    private String host;

    @Value("${spring.mail.port:587}")
    private String port;

    public EmailServiceImpl(StringRedisTemplate stringRedisTemplate) {
        this.stringRedisTemplate = stringRedisTemplate;
    }

    @Override
    public void sendVerificationCode(String to) {
        validateMailConfig();
        String code = String.format("%06d", RANDOM.nextInt(1000000));
        try {
            MimeMessage message = new MimeMessage(createSession());
            message.setFrom(new InternetAddress(username));
            message.setRecipients(MimeMessage.RecipientType.TO, to);
            message.setSubject("同城生活 - 您的验证码");
            message.setContent(buildHtmlEmail(code), "text/html;charset=UTF-8");
            Transport.send(message);
            stringRedisTemplate.opsForValue().set(CODE_PREFIX + to, code, CODE_TTL, TimeUnit.MINUTES);
            log.info("验证码已发送至: {}", to);
        } catch (Exception exception) {
            stringRedisTemplate.delete(CODE_PREFIX + to);
            log.error("发送验证码失败: {}", to, exception);
            throw new RuntimeException(EMAIL_SEND_FAILED_MESSAGE, exception);
        }
    }

    @Override
    public boolean verifyCode(String email, String code) {
        String key = CODE_PREFIX + email;
        String cached = stringRedisTemplate.opsForValue().get(key);
        if (cached == null) {
            return false;
        }
        boolean valid = code.equals(cached);
        if (valid) {
            stringRedisTemplate.delete(key);
        }
        return valid;
    }

    private Session createSession() {
        Properties props = new Properties();
        props.put("mail.smtp.host", host);
        props.put("mail.smtp.port", port);
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        return Session.getInstance(props, new jakarta.mail.Authenticator() {
            @Override
            protected jakarta.mail.PasswordAuthentication getPasswordAuthentication() {
                return new jakarta.mail.PasswordAuthentication(username, password);
            }
        });
    }

    private String buildHtmlEmail(String code) {
        return "<div style=\"font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; max-width: 480px; margin: 0 auto; background: #fff;\">"
                + "<div style=\"background: linear-gradient(135deg, #ff3654 0%, #ff6b8a 100%); padding: 32px; text-align: center;\">"
                + "<h1 style=\"color: #fff; font-size: 24px; margin: 0; letter-spacing: 2px;\">同城生活</h1>"
                + "<p style=\"color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0;\">开启您的本地优质社区生活</p>"
                + "</div>"
                + "<div style=\"padding: 32px; text-align: center;\">"
                + "<p style=\"color: #666; font-size: 16px;\">您的验证码是：</p>"
                + "<div style=\"background: #f8f8f8; border-radius: 12px; padding: 24px; margin: 20px 0;\">"
                + "<span style=\"font-size: 40px; font-weight: bold; color: #ff3654; letter-spacing: 8px;\">" + code + "</span>"
                + "</div>"
                + "<p style=\"color: #999; font-size: 12px;\">验证码 5 分钟内有效，请勿泄露给他人。</p>"
                + "</div>"
                + "<div style=\"background: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eee;\">"
                + "<p style=\"color: #bbb; font-size: 12px; margin: 0;\">同城生活社区平台 | 请勿回复此邮件</p>"
                + "</div>"
                + "</div>";
    }

    private void validateMailConfig() {
        if (isBlank(username) || isBlank(password)) {
            throw new RuntimeException(EMAIL_CONFIG_MISSING_MESSAGE);
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
