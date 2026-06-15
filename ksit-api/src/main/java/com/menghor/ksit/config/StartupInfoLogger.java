package com.menghor.ksit.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class StartupInfoLogger {

    private final Environment env;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        String port = env.getProperty("server.port", "7000");
        String profile = String.join(", ", env.getActiveProfiles());
        String base = "http://localhost:" + port;

        log.info("""

                ╔══════════════════════════════════════════════════════════╗
                ║              KSIT School API — Ready ✓                  ║
                ╠══════════════════════════════════════════════════════════╣
                ║  Profile   : {}
                ║  Timezone  : Asia/Phnom_Penh (UTC+7)
                ╠══════════════════════════════════════════════════════════╣
                ║  API Base  : {}/api/v1
                ║  Swagger   : {}/swagger-ui/swagger-ui/index.html
                ║  API Docs  : {}/v3/api-docs
                ╚══════════════════════════════════════════════════════════╝
                """,
                profile.isBlank() ? "default" : profile,
                base, base, base);
    }
}
