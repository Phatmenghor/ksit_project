package com.menghor.ksit.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("KS-IT School Management API")
                        .version("1.0.0")
                        .description("REST API documentation for KS-IT School Management System")
                        .contact(new Contact()
                                .name("KS-IT School")
                                .email("support@ksit.edu.kh")))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter JWT token")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }

    @Bean
    public GroupedOpenApi authGroup() {
        return GroupedOpenApi.builder()
                .group("1. Authentication & Users")
                .packagesToScan("com.menghor.ksit.feature.auth.controller")
                .build();
    }

    @Bean
    public GroupedOpenApi masterDataGroup() {
        return GroupedOpenApi.builder()
                .group("2. Master Data")
                .packagesToScan("com.menghor.ksit.feature.master.controller")
                .build();
    }

    @Bean
    public GroupedOpenApi schoolGroup() {
        return GroupedOpenApi.builder()
                .group("3. School")
                .packagesToScan("com.menghor.ksit.feature.school.controller")
                .build();
    }

    @Bean
    public GroupedOpenApi attendanceGroup() {
        return GroupedOpenApi.builder()
                .group("4. Attendance & Score")
                .packagesToScan("com.menghor.ksit.feature.attendance.controller")
                .build();
    }

    @Bean
    public GroupedOpenApi surveyGroup() {
        return GroupedOpenApi.builder()
                .group("5. Survey")
                .packagesToScan("com.menghor.ksit.feature.survey.controller")
                .build();
    }

    @Bean
    public GroupedOpenApi menuGroup() {
        return GroupedOpenApi.builder()
                .group("6. Menu & Permissions")
                .packagesToScan("com.menghor.ksit.feature.menu.controller")
                .build();
    }

    @Bean
    public GroupedOpenApi settingGroup() {
        return GroupedOpenApi.builder()
                .group("7. Settings & Utilities")
                .packagesToScan("com.menghor.ksit.feature.setting.controller")
                .build();
    }
}
