package com.menghor.ksit.feature.auth.security;

import com.menghor.ksit.enumations.RoleEnum;
import com.menghor.ksit.feature.auth.models.UserEntity;
import com.menghor.ksit.feature.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserPermissionEvaluator {

    private final UserRepository userRepository;

    public boolean isSameUser(Authentication authentication, Long userId) {
        String username = extractUsername(authentication);
        if (username == null) return false;
        return userRepository.findById(userId)
                .map(user -> user.getUsername().equals(username))
                .orElse(false);
    }

    public boolean canAccessUser(Authentication authentication, Long userId) {
        String username = extractUsername(authentication);
        if (username == null) return false;

        if (isSameUser(authentication, userId)) {
            return true;
        }

        Optional<UserEntity> targetUserOpt = userRepository.findById(userId);
        if (targetUserOpt.isEmpty()) {
            log.warn("Access check failed - user not found. userId={}", userId);
            return false;
        }

        UserEntity targetUser = targetUserOpt.get();
        return targetUser.getRoles().stream()
                .anyMatch(role -> role.getName() == RoleEnum.STUDENT);
    }

    public boolean canModifyUser(Authentication authentication, Long userId) {
        return canAccessUser(authentication, userId);
    }

    public boolean canStudentUpdateSelf(Authentication authentication, Long userId) {
        return isSameUser(authentication, userId);
    }

    private String extractUsername(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            return (String) principal;
        }
        return null;
    }
}