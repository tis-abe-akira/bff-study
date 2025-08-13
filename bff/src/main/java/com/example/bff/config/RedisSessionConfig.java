package com.example.bff.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;

/**
 * Redis Session Configuration for ECS/Fargate
 * AWS環境でのセッション外部化設定
 */
@Configuration
@Profile("aws")
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 1800) // 30分
public class RedisSessionConfig {
    // Spring Session Redis auto-configuration を利用
    // application-aws.yml の設定で Redis 接続が自動設定される
}