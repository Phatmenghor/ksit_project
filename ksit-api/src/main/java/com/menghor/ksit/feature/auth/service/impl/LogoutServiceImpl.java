package com.menghor.ksit.feature.auth.service.impl;

import com.menghor.ksit.feature.auth.models.BlacklistedTokenEntity;
import com.menghor.ksit.feature.auth.repository.BlacklistedTokenRepository;
import com.menghor.ksit.feature.auth.security.JWTGenerator;
import com.menghor.ksit.feature.auth.service.LogoutService;
import com.menghor.ksit.utils.database.SecurityUtils;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Service
@RequiredArgsConstructor
@Slf4j
public class LogoutServiceImpl implements LogoutService {

    private final BlacklistedTokenRepository blacklistedTokenRepository;
    private final SecurityUtils securityUtils;
    private final JWTGenerator jwtGenerator;

    @Value("${jwt.secret.key}")
    private String secretKey;

    @Override
    @Transactional
    public void logout(String token) {
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(jwtGenerator.getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            Date expirationDate = claims.getExpiration();
            String username = claims.getSubject();

            BlacklistedTokenEntity blacklistedTokenEntity = BlacklistedTokenEntity.builder()
                    .token(token)
                    .username(username)
                    .createdAt(LocalDateTime.now())
                    .expirationDate(LocalDateTime.ofInstant(expirationDate.toInstant(), ZoneId.systemDefault()))
                    .build();

            blacklistedTokenRepository.save(blacklistedTokenEntity);
            SecurityContextHolder.clearContext();
            log.info("User logged out successfully. username={}", username);

        } catch (Exception e) {
            log.error("Logout failed: Invalid or malformed token", e);
        }
    }

    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void removeExpiredBlacklistedTokens() {
        int deletedCount = blacklistedTokenRepository.deleteExpiredTokens(LocalDateTime.now());
        log.info("Removed {} expired blacklisted tokens", deletedCount);
    }
}
