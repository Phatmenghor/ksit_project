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
    public GroupedOpenApi allGroup() {
        return GroupedOpenApi.builder()
                .group("0. All APIs")
                .pathsToMatch("/api/**")
                .build();
    }

    @Bean
    public GroupedOpenApi authGroup() {
        return GroupedOpenApi.builder()
                .group("1. Authentication")
                .pathsToMatch("/api/v1/auth/**")
                .build();
    }

    @Bean
    public GroupedOpenApi studentsGroup() {
        return GroupedOpenApi.builder()
                .group("2. Students")
                .pathsToMatch("/api/v1/students/**")
                .build();
    }

    @Bean
    public GroupedOpenApi staffGroup() {
        return GroupedOpenApi.builder()
                .group("3. Staff")
                .pathsToMatch(
                        "/api/v1/staff/**",
                        "/api/v1/staff-teacher-roles/**"
                )
                .build();
    }

    @Bean
    public GroupedOpenApi paymentsGroup() {
        return GroupedOpenApi.builder()
                .group("4. Payments")
                .pathsToMatch("/api/v1/payments/**")
                .build();
    }

    @Bean
    public GroupedOpenApi masterDataGroup() {
        return GroupedOpenApi.builder()
                .group("5. Master Data")
                .pathsToMatch(
                        "/api/v1/classes/**",
                        "/api/v1/departments/**",
                        "/api/v1/majors/**",
                        "/api/v1/rooms/**",
                        "/api/v1/semesters/**",
                        "/api/v1/subjects/**"
                )
                .build();
    }

    @Bean
    public GroupedOpenApi schoolGroup() {
        return GroupedOpenApi.builder()
                .group("6. School")
                .pathsToMatch(
                        "/api/v1/courses/**",
                        "/api/v1/schedules/**",
                        "/api/v1/requests/**"
                )
                .build();
    }

    @Bean
    public GroupedOpenApi attendanceGroup() {
        return GroupedOpenApi.builder()
                .group("7. Attendance")
                .pathsToMatch("/api/v1/attendance/**")
                .build();
    }

    @Bean
    public GroupedOpenApi scoresGroup() {
        return GroupedOpenApi.builder()
                .group("8. Scores & Transcripts")
                .pathsToMatch(
                        "/api/v1/score/**",
                        "/api/v1/transcript/**"
                )
                .build();
    }

    @Bean
    public GroupedOpenApi surveyGroup() {
        return GroupedOpenApi.builder()
                .group("9. Survey")
                .pathsToMatch("/api/v1/surveys/**")
                .build();
    }

    @Bean
    public GroupedOpenApi menuGroup() {
        return GroupedOpenApi.builder()
                .group("10. Menu & Permissions")
                .pathsToMatch("/api/v1/menus/**")
                .build();
    }

    @Bean
    public GroupedOpenApi settingGroup() {
        return GroupedOpenApi.builder()
                .group("11. Settings & Utilities")
                .pathsToMatch(
                        "/api/images/**",
                        "/api/v1/enums/**",
                        "/api/v1/statistics/**"
                )
                .build();
    }
}
