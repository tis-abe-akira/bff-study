package com.example.bff.lambda;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("local")
class BffLambdaApplicationTests {

    @Test
    void contextLoads() {
        // Spring Context正常起動確認
    }

    @Test
    void mockAuthServiceTest() {
        // モック認証サービスのテスト
        // TODO: 実装
    }

    @Test
    void proxyServiceTest() {
        // プロキシサービスのテスト
        // TODO: 実装
    }
}