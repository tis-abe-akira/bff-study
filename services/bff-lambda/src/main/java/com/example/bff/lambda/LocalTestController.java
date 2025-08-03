package com.example.bff.lambda;

import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller for local testing.
 * This controller is only active when the 'local' profile is enabled.
 * It converts an HttpServletRequest into an APIGatewayProxyRequestEvent
 * to simulate the AWS API Gateway environment for local development.
 */
@RestController
@Profile("local")
public class LocalTestController {

    @Autowired
    private LambdaFunctionHandler functionHandler;

    @RequestMapping("/**")
    public ResponseEntity<String> handleLocalRequest(HttpServletRequest httpServletRequest,
                                                     @RequestBody(required = false) String body) {
        
        APIGatewayProxyRequestEvent apiGatewayRequest = adaptRequest(httpServletRequest, body);
        
        APIGatewayProxyResponseEvent apiGatewayResponse = functionHandler.handleApiGatewayRequest(apiGatewayRequest);

        return adaptResponse(apiGatewayResponse);
    }

    private APIGatewayProxyRequestEvent adaptRequest(HttpServletRequest httpServletRequest, String body) {
        APIGatewayProxyRequestEvent apiGatewayRequest = new APIGatewayProxyRequestEvent();
        apiGatewayRequest.setHttpMethod(httpServletRequest.getMethod());
        apiGatewayRequest.setPath(httpServletRequest.getRequestURI());
        apiGatewayRequest.setBody(body);

        // Extract headers
        Map<String, String> headers = new HashMap<>();
        Enumeration<String> headerNames = httpServletRequest.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            headers.put(headerName, httpServletRequest.getHeader(headerName));
        }
        apiGatewayRequest.setHeaders(headers);

        // Extract query parameters
        Map<String, String> queryParameters = new HashMap<>();
        if (httpServletRequest.getQueryString() != null) {
            String[] pairs = httpServletRequest.getQueryString().split("&");
            for (String pair : pairs) {
                int idx = pair.indexOf("=");
                if (idx > 0) {
                     queryParameters.put(pair.substring(0, idx), pair.substring(idx + 1));
                }
            }
        }
        apiGatewayRequest.setQueryStringParameters(queryParameters);

        return apiGatewayRequest;
    }

    private ResponseEntity<String> adaptResponse(APIGatewayProxyResponseEvent apiGatewayResponse) {
        HttpHeaders httpHeaders = new HttpHeaders();
        if (apiGatewayResponse.getHeaders() != null) {
            httpHeaders.setAll(apiGatewayResponse.getHeaders());
        }
        
        return new ResponseEntity<>(
                apiGatewayResponse.getBody(),
                httpHeaders,
                HttpStatus.valueOf(apiGatewayResponse.getStatusCode())
        );
    }
}
