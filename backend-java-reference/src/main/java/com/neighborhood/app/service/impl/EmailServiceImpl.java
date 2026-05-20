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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Properties;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class EmailServiceImpl implements EmailService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final Session session;

    @Value("${spring.mail.username:}")
    private String username;

    @Value("${spring.mail.password:}")
    private String password;

    private static final String CODE_PREFIX = "email:code:";
    private static final long CODE_TTL = 5;
    private static final Random RANDOM = new Random();

    public EmailServiceImpl(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.session = createSession();
    }

    private Session createSession() {
        Properties props = new Properties();
        props.put("mail.smtp.host", "smtp.qq.com");
        props.put("mail.smtp.port", "587");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        return Session.getInstance(props, new jakarta.mail.Authenticator() {
            @Override
            protected jakarta.mail.PasswordAuthentication getPasswordAuthentication() {
                return new jakarta.mail.PasswordAuthentication(username, password);
            }
        });
    }

    @Override
    public void sendVerificationCode(String to) {
        String code = String.format("%06d", RANDOM.nextInt(1000000));
        redisTemplate.opsForValue().set(CODE_PREFIX + to, code, CODE_TTL, TimeUnit.MINUTES);
        try {
            MimeMessage message = new MimeMessage(session);
            message.setFrom(new InternetAddress(username));
            message.setRecipients(MimeMessage.RecipientType.TO, to);
            message.setSubject("同城生活 - 您的验证码");
            message.setContent(buildHtmlEmail(code), "text/html;charset=UTF-8");
            Transport.send(message);
            log.info("验证码已发送至: {}", to);
        } catch (Exception e) {
            log.error("发送验证码失败: {}", to, e);
            throw new RuntimeException("发送验证码失败");
        }
    }

    private String buildHtmlEmail(String code) {
        return "<div style=\"font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; max-width: 480px; margin: 0 auto; background: #fff;\">" +
               "<div style=\"background: linear-gradient(135deg, #ff3654 0%, #ff6b8a 100%); padding: 32px; text-align: center;\">" +
               "<h1 style=\"color: #fff; font-size: 24px; margin: 0; letter-spacing: 2px;\">🏠 同城生活</h1>" +
               "<p style=\"color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0;\">开启您的优质社区之旅</p>" +
               "</div>" +
               "<div style=\"padding: 32px; text-align: center;\">" +
               "<p style=\"color: #666; font-size: 16px;\">您的验证码是：</p>" +
               "<div style=\"background: #f8f8f8; border-radius: 12px; padding: 24px; margin: 20px 0;\">" +
               "<span style=\"font-size: 40px; font-weight: bold; color: #ff3654; letter-spacing: 8px;\">" + code + "</span>" +
               "</div>" +
               "<p style=\"color: #999; font-size: 12px;\">验证码 5 分钟内有效，请勿泄露给他人。</p>" +
               "</div>" +
               "<div style=\"background: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eee;\">" +
               "<p style=\"color: #bbb; font-size: 12px; margin: 0;\">同城生活社区平台 · 请勿回复此邮件</p>" +
               "</div>" +
               "</div>";
    }

    @Override
    public boolean verifyCode(String email, String code) {
        String key = CODE_PREFIX + email;
        Object cached = redisTemplate.opsForValue().get(key);
        if (cached == null) return false;
        boolean valid = code.equals(cached.toString());
        if (valid) redisTemplate.delete(key);
        return valid;
    }
}