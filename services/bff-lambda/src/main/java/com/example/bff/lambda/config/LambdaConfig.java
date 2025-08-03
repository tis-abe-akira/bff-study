package com.example.bff.lambda.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;
import org.springframework.web.client.RestTemplate;

/**
 * Lambda環境用設定
 */
@Configuration
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 1800) // 30分
public class LambdaConfig {

    /**
     * Redis接続設定
     */
    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        String redisHost = System.getenv().getOrDefault("REDIS_ENDPOINT", "localhost");
        int redisPort = Integer.parseInt(System.getenv().getOrDefault("REDIS_PORT", "6379"));
        
        System.out.println("Connecting to Redis: " + redisHost + ":" + redisPort);
        
        return new LettuceConnectionFactory(redisHost, redisPort);
    }

    /**
     * RedisTemplate設定
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        
        // Key-Value シリアライザー設定
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        
        template.afterPropertiesSet();
        return template;
    }

    /**
     * RestTemplate（プロキシ通信用）
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    /**
     * Lambda環境判定Bean
     */
    @Bean
    @ConditionalOnProperty(name = "spring.profiles.active", havingValue = "lambda")
    public LambdaEnvironmentInfo lambdaEnvironmentInfo() {
        return new LambdaEnvironmentInfo();
    }

    /**
     * Lambda環境情報
     */
    public static class LambdaEnvironmentInfo {
        public boolean isLambdaEnvironment() {
            return System.getenv("AWS_LAMBDA_FUNCTION_NAME") != null;
        }
        
        public String getFunctionName() {
            return System.getenv("AWS_LAMBDA_FUNCTION_NAME");
        }
        
        public String getMemorySize() {
            return System.getenv("AWS_LAMBDA_FUNCTION_MEMORY_SIZE");
        }
    }
}