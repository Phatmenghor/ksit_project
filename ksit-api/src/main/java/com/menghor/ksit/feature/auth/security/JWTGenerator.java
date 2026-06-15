package com.menghor.ksit.feature.auth.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
@Slf4j
public class JWTGenerator {

    @Value("${jwt.secret.key}")
    private String secretKey;

    @Value("${jwt.expiration-min}")
    private long jwtExpirationInMinutes;

    public SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String generateToken(Authentication authentication) {
        String username = authentication.getName();
        Date currentDate = new Date();
        Date expireDate = new Date(currentDate.getTime() + jwtExpirationInMinutes * 60 * 1000);
        return Jwts.builder()
                .issuedAt(currentDate)
                .expiration(expireDate)
                .subject(username)
                .signWith(getSigningKey())
                .compact();
    }

    public String getUsernameFromJWT(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
        } catch (ExpiredJwtException e) {
            throw new ExpiredJwtException(e.getHeader(), e.getClaims(), "JWT token has expired");
        } catch (MalformedJwtException e) {
            throw new MalformedJwtException("JWT token is malformed");
        } catch (SignatureException e) {
            throw new SignatureException("JWT signature validation failed");
        } catch (UnsupportedJwtException e) {
            throw new UnsupportedJwtException("JWT token is not supported");
        } catch (IllegalArgumentException e) {
            throw new AuthenticationCredentialsNotFoundException("JWT token is invalid");
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            throw new ExpiredJwtException(e.getHeader(), e.getClaims(), "JWT token has expired");
        } catch (MalformedJwtException e) {
            throw new MalformedJwtException("JWT token is malformed");
        } catch (SignatureException e) {
            throw new SignatureException("JWT signature validation failed");
        } catch (UnsupportedJwtException e) {
            throw new UnsupportedJwtException("JWT token is not supported");
        } catch (IllegalArgumentException e) {
            throw new AuthenticationCredentialsNotFoundException("JWT token is invalid");
        } catch (Exception e) {
            throw new AuthenticationCredentialsNotFoundException("JWT token validation failed: " + e.getMessage());
        }
    }

    public Date getTokenExpiration(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getExpiration();
        } catch (ExpiredJwtException e) {
            throw new ExpiredJwtException(e.getHeader(), e.getClaims(), "JWT token has expired");
        } catch (Exception e) {
            throw new AuthenticationCredentialsNotFoundException("Unable to get token expiration: " + e.getMessage());
        }
    }

    public boolean isTokenExpired(String token) {
        try {
            return getTokenExpiration(token).before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        } catch (Exception e) {
            return true;
        }
    }
}
