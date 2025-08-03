package com.example.bff.lambda;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestStreamHandler;
import org.springframework.cloud.function.adapter.aws.FunctionInvoker;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * AWS Lambda Entry Point for API Gateway Proxy Integration
 * この関数がCDKで指定されるハンドラーになります
 */
public class StreamLambdaHandler extends FunctionInvoker implements RequestStreamHandler {

    public StreamLambdaHandler() {
        // Spring Boot アプリケーションクラスを指定
        // この初期化によりSpring Contextが起動します
    }

    @Override
    public void handleRequest(InputStream input, OutputStream output, Context context) throws IOException {
        System.out.println("Lambda Handler called");
        System.out.println("Request ID: " + context.getAwsRequestId());
        System.out.println("Function Name: " + context.getFunctionName());
        
        try {
            super.handleRequest(input, output, context);
        } catch (Exception e) {
            System.err.println("Error in Lambda Handler: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}