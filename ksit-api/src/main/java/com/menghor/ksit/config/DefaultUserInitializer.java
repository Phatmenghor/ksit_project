package com.menghor.ksit.config;

import com.menghor.ksit.enumations.RoleEnum;
import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.feature.auth.models.Role;
import com.menghor.ksit.feature.auth.models.UserEntity;
import com.menghor.ksit.feature.auth.repository.RoleRepository;
import com.menghor.ksit.feature.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(2)
public class DefaultUserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }
        log.info("Initializing default developer user...");
        createDeveloperUser();
        log.info("Default developer user initialized successfully");
    }

    private void createDeveloperUser() {
        UserEntity developer = new UserEntity();
        developer.setUsername("phatmenghor19@gmail.com");
        developer.setEmail("phatmenghor19@gmail.com");
        developer.setPassword(passwordEncoder.encode("88889999"));
        developer.setStatus(Status.ACTIVE);

        Role devRole = roleRepository.findByName(RoleEnum.DEVELOPER)
                .orElseThrow(() -> new RuntimeException("Role not found: " + RoleEnum.DEVELOPER));
        developer.setRoles(Collections.singletonList(devRole));

        userRepository.save(developer);
    }
}