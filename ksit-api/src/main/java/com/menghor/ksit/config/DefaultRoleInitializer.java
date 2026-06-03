package com.menghor.ksit.config;

import com.menghor.ksit.enumations.RoleEnum;
import com.menghor.ksit.feature.auth.models.Role;
import com.menghor.ksit.feature.auth.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Order(1) // Run before DefaultUserInitializer
public class DefaultRoleInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public void run(String... args) {

        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(RoleEnum.DEVELOPER));
            roleRepository.save(new Role(RoleEnum.ADMIN));
            roleRepository.save(new Role(RoleEnum.STAFF));
            roleRepository.save(new Role(RoleEnum.TEACHER));
            roleRepository.save(new Role(RoleEnum.STUDENT));
        } else {
        }
    }
}