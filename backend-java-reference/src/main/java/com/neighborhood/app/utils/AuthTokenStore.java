package com.neighborhood.app.utils;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.DigestUtils;

/** 认证 Token 存储工具，支持同一账号多端并存。 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuthTokenStore {

    private static final String LEGACY_TOKEN_PREFIX = "token:";
    private static final String TOKEN_INDEX_PREFIX = "token:index:";
    private static final String TOKEN_SESSION_PREFIX = "token:session:";
    private static final String TOKEN_ONLINE_PREFIX = "token:online:";

    private final StringRedisTemplate stringRedisTemplate;

    public boolean storeToken(String userId, String token, long ttlMillis) {
        if (isBlank(userId) || isBlank(token) || ttlMillis <= 0) {
            return false;
        }
        String tokenHash = tokenHash(token);
        String sessionKey = sessionKey(userId, tokenHash);
        String indexKey = indexKey(userId);
        try {
            stringRedisTemplate.opsForValue().set(sessionKey, "1", ttlMillis, TimeUnit.MILLISECONDS);
            stringRedisTemplate.opsForSet().add(indexKey, tokenHash);
            stringRedisTemplate.expire(indexKey, ttlMillis, TimeUnit.MILLISECONDS);
            markOnline(userId, ttlMillis);
            return true;
        } catch (Exception exception) {
            log.error("store auth token failed, userId={}", userId, exception);
            return false;
        }
    }

    public boolean isTokenActive(String userId, String token, long ttlMillis) {
        if (isBlank(userId) || isBlank(token)) {
            return false;
        }
        String tokenHash = tokenHash(token);
        String sessionKey = sessionKey(userId, tokenHash);
        try {
            if (Boolean.TRUE.equals(stringRedisTemplate.hasKey(sessionKey))) {
                refreshSession(userId, tokenHash, ttlMillis);
                return true;
            }
        } catch (Exception exception) {
            log.error("check auth token failed, userId={}", userId, exception);
            return false;
        }
        return migrateLegacyTokenIfMatched(userId, token, ttlMillis);
    }

    public boolean hasActiveToken(String userId) {
        if (isBlank(userId)) {
            return false;
        }
        try {
            if (Boolean.TRUE.equals(stringRedisTemplate.hasKey(onlineKey(userId)))) {
                return true;
            }
            if (hasActiveSession(userId)) {
                markOnline(userId, TimeUnit.MINUTES.toMillis(30));
                return true;
            }
            return Boolean.TRUE.equals(stringRedisTemplate.hasKey(legacyKey(userId)));
        } catch (Exception exception) {
            log.error("check active token failed, userId={}", userId, exception);
            return false;
        }
    }

    public boolean revokeToken(String userId, String token) {
        if (isBlank(userId) || isBlank(token)) {
            return false;
        }
        try {
            String tokenHash = tokenHash(token);
            stringRedisTemplate.delete(sessionKey(userId, tokenHash));
            stringRedisTemplate.opsForSet().remove(indexKey(userId), tokenHash);
            String legacyKey = legacyKey(userId);
            String legacyToken = stringRedisTemplate.opsForValue().get(legacyKey);
            if (token.equals(legacyToken)) {
                stringRedisTemplate.delete(legacyKey);
            }
            refreshOnlineStateAfterRevoke(userId);
            return true;
        } catch (Exception exception) {
            log.error("revoke auth token failed, userId={}", userId, exception);
            return false;
        }
    }

    private void refreshSession(String userId, String tokenHash, long ttlMillis) {
        if (ttlMillis <= 0) {
            return;
        }
        String sessionKey = sessionKey(userId, tokenHash);
        String indexKey = indexKey(userId);
        stringRedisTemplate.expire(sessionKey, ttlMillis, TimeUnit.MILLISECONDS);
        stringRedisTemplate.opsForSet().add(indexKey, tokenHash);
        stringRedisTemplate.expire(indexKey, ttlMillis, TimeUnit.MILLISECONDS);
        markOnline(userId, ttlMillis);
    }

    private boolean hasActiveSession(String userId) {
        Set<String> tokenHashes = stringRedisTemplate.opsForSet().members(indexKey(userId));
        if (tokenHashes == null || tokenHashes.isEmpty()) {
            return false;
        }

        boolean hasActive = false;
        List<String> expiredHashes = new ArrayList<>();
        for (String tokenHash : tokenHashes) {
            if (Boolean.TRUE.equals(stringRedisTemplate.hasKey(sessionKey(userId, tokenHash)))) {
                hasActive = true;
            } else {
                expiredHashes.add(tokenHash);
            }
        }

        if (!expiredHashes.isEmpty()) {
            stringRedisTemplate.opsForSet().remove(indexKey(userId), expiredHashes.toArray(String[]::new));
        }
        return hasActive;
    }

    private boolean migrateLegacyTokenIfMatched(String userId, String token, long ttlMillis) {
        String legacyToken = stringRedisTemplate.opsForValue().get(legacyKey(userId));
        if (legacyToken == null || !legacyToken.equals(token)) {
            return false;
        }
        if (!storeToken(userId, token, ttlMillis)) {
            return false;
        }
        stringRedisTemplate.delete(legacyKey(userId));
        return true;
    }

    private void refreshOnlineStateAfterRevoke(String userId) {
        if (hasActiveSession(userId) || Boolean.TRUE.equals(stringRedisTemplate.hasKey(legacyKey(userId)))) {
            markOnline(userId, TimeUnit.MINUTES.toMillis(30));
            return;
        }
        stringRedisTemplate.delete(onlineKey(userId));
    }

    private void markOnline(String userId, long ttlMillis) {
        if (ttlMillis <= 0) {
            return;
        }
        stringRedisTemplate.opsForValue().set(onlineKey(userId), "1", ttlMillis, TimeUnit.MILLISECONDS);
    }

    private String legacyKey(String userId) {
        return LEGACY_TOKEN_PREFIX + userId;
    }

    private String indexKey(String userId) {
        return TOKEN_INDEX_PREFIX + userId;
    }

    private String sessionKey(String userId, String tokenHash) {
        return TOKEN_SESSION_PREFIX + userId + ":" + tokenHash;
    }

    private String onlineKey(String userId) {
        return TOKEN_ONLINE_PREFIX + userId;
    }

    private String tokenHash(String token) {
        return DigestUtils.md5DigestAsHex(token.getBytes(StandardCharsets.UTF_8));
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
