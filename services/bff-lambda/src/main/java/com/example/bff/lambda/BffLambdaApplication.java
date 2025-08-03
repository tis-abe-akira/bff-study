package com.example.bff.lambda;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;

import java.util.function.Function;

/**
 * BFF Lambda アプリケーション
 * Spring Cloud Function for AWS Lambda
 */
@SpringBootApplication
@ComponentScan(basePackages = "com.example.bff.lambda")
public class BffLambdaApplication {

    public static void main(String[] args) {
        SpringApplication.run(BffLambdaApplication.class, args);
    }

    /**
     * Lambda Function Entry Point
     * API Gateway Proxy Integration用
     */
    @Bean
    public Function<String, String> hello() {
        return input -> {
            System.out.println("Lambda Input: " + input);
            return "Hello from BFF Lambda! Input was: " + input;
        };
    }
}