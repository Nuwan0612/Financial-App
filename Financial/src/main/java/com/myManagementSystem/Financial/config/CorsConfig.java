package com.myManagementSystem.Financial.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**") // 1. Apply this rule to ALL your API endpoints
        .allowedOrigins("http://localhost:3000") // 2. Explicitly allow your Next.js frontend
        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH") // 3. Allow these actions
        .allowedHeaders("*") // 4. Allow any headers (like Authorization or Content-Type)
        .allowCredentials(true) // 5. Important if you ever add login cookies or tokens later
        .maxAge(3600); // 6. Cache this safe connection for 1 hour to speed up the app
  }
}
