/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.neighborhood.app.dto.user.CaptchaResponse;
import com.neighborhood.app.service.CaptchaService;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import javax.imageio.ImageIO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/** 文件作用：图形验证码服务实现。 */
@Service
@RequiredArgsConstructor
public class CaptchaServiceImpl implements CaptchaService {

    private static final String CAPTCHA_KEY_PREFIX = "captcha:";
    private static final String CAPTCHA_RATE_PREFIX = "captcha:rate:";
    private static final String CAPTCHA_FAIL_PREFIX = "captcha:fail:";
    private static final int CAPTCHA_TTL_SECONDS = 180;
    private static final int CAPTCHA_RATE_LIMIT = 12;
    private static final int CAPTCHA_RATE_WINDOW_SECONDS = 60;
    private static final int CAPTCHA_FAIL_LIMIT = 5;
    private static final int CAPTCHA_WIDTH = 110;
    private static final int CAPTCHA_HEIGHT = 45;
    private static final String CAPTCHA_POOL = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private final StringRedisTemplate stringRedisTemplate;

    @Override
    public CaptchaResponse generateCaptcha(String clientKey) {
        assertRateLimit(clientKey);
        String captchaId = UUID.randomUUID().toString().replace("-", "");
        String captchaCode = randomCode(4);
        stringRedisTemplate.opsForValue().set(captchaRedisKey(captchaId), captchaCode, CAPTCHA_TTL_SECONDS, TimeUnit.SECONDS);
        return new CaptchaResponse(captchaId, renderCaptchaBase64(captchaCode), CAPTCHA_TTL_SECONDS);
    }

    @Override
    public boolean validateCaptcha(String clientKey, String captchaId, String captchaCode) {
        if (isBlank(captchaId) || isBlank(captchaCode)) {
            return false;
        }
        String failKey = captchaFailKey(captchaId);
        String failCount = stringRedisTemplate.opsForValue().get(failKey);
        if (failCount != null && Integer.parseInt(failCount) >= CAPTCHA_FAIL_LIMIT) {
            stringRedisTemplate.delete(captchaRedisKey(captchaId));
            return false;
        }

        String cachedCode = stringRedisTemplate.opsForValue().get(captchaRedisKey(captchaId));
        if (cachedCode == null || !cachedCode.equalsIgnoreCase(captchaCode.trim())) {
            Long currentFails = stringRedisTemplate.opsForValue().increment(failKey);
            if (currentFails != null && currentFails == 1) {
                stringRedisTemplate.expire(failKey, CAPTCHA_TTL_SECONDS, TimeUnit.SECONDS);
            }
            return false;
        }

        stringRedisTemplate.delete(captchaRedisKey(captchaId));
        stringRedisTemplate.delete(failKey);
        return true;
    }

    private void assertRateLimit(String clientKey) {
        String rateKey = CAPTCHA_RATE_PREFIX + safeClientKey(clientKey);
        Long count = stringRedisTemplate.opsForValue().increment(rateKey);
        if (count != null && count == 1) {
            stringRedisTemplate.expire(rateKey, CAPTCHA_RATE_WINDOW_SECONDS, TimeUnit.SECONDS);
        }
        if (count != null && count > CAPTCHA_RATE_LIMIT) {
            throw new IllegalStateException("验证码请求过于频繁，请稍后再试");
        }
    }

    private String renderCaptchaBase64(String captchaCode) {
        try {
            BufferedImage image = new BufferedImage(CAPTCHA_WIDTH, CAPTCHA_HEIGHT, BufferedImage.TYPE_INT_RGB);
            Graphics2D graphics = image.createGraphics();
            try {
                graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                graphics.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
                graphics.setColor(new Color(248, 250, 252));
                graphics.fillRect(0, 0, CAPTCHA_WIDTH, CAPTCHA_HEIGHT);

                for (int index = 0; index < 6; index += 1) {
                    graphics.setColor(new Color(randomInt(180), randomInt(180), randomInt(180), 110));
                    graphics.setStroke(new BasicStroke(1.2f));
                    graphics.drawLine(randomInt(CAPTCHA_WIDTH), randomInt(CAPTCHA_HEIGHT), randomInt(CAPTCHA_WIDTH), randomInt(CAPTCHA_HEIGHT));
                }

                graphics.setFont(new Font("JetBrains Mono", Font.BOLD, 24));
                for (int index = 0; index < captchaCode.length(); index += 1) {
                    graphics.setColor(randomTextColor(index));
                    double angle = Math.toRadians(randomInt(28) - 14);
                    int x = 14 + index * 23;
                    int y = 30 + randomInt(6) - 3;
                    graphics.rotate(angle, x, y);
                    graphics.drawString(String.valueOf(captchaCode.charAt(index)), x, y);
                    graphics.rotate(-angle, x, y);
                }
            } finally {
                graphics.dispose();
            }

            ByteArrayOutputStream output = new ByteArrayOutputStream();
            ImageIO.write(image, "png", output);
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(output.toByteArray());
        } catch (Exception exception) {
            throw new IllegalStateException("生成图形验证码失败", exception);
        }
    }

    private Color randomTextColor(int index) {
        Color[] palette = new Color[] {
                new Color(79, 70, 229),
                new Color(37, 99, 235),
                new Color(8, 145, 178),
                new Color(5, 150, 105),
                new Color(217, 119, 6),
                new Color(220, 38, 38)
        };
        return palette[index % palette.length];
    }

    private String randomCode(int length) {
        StringBuilder builder = new StringBuilder(length);
        for (int index = 0; index < length; index += 1) {
            builder.append(CAPTCHA_POOL.charAt(randomInt(CAPTCHA_POOL.length())));
        }
        return builder.toString();
    }

    private int randomInt(int bound) {
        return (int) Math.floor(Math.random() * bound);
    }

    private String captchaRedisKey(String captchaId) {
        return CAPTCHA_KEY_PREFIX + captchaId;
    }

    private String captchaFailKey(String captchaId) {
        return CAPTCHA_FAIL_PREFIX + captchaId;
    }

    private String safeClientKey(String clientKey) {
        if (isBlank(clientKey)) {
            return "anonymous";
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(clientKey.trim().getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException exception) {
            return clientKey.replaceAll("[^a-zA-Z0-9_-]", "_");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
