package com.example.SAC.service;

import com.example.SAC.entity.RecaptchaResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class CaptchaService {

    private static final String URL = "https://www.google.com/recaptcha/api/siteverify";

    @Value("${recaptcha.secret}")
    private String SECRET;

    public boolean validateCaptcha(String token) {
        RestTemplate restTemplate = new RestTemplate();
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("secret", SECRET);
        params.add("response", token);

        ResponseEntity<RecaptchaResponse> response = restTemplate.postForEntity(
                URL, params, RecaptchaResponse.class
        );
        return response.getBody() != null && response.getBody().isSuccess();
    }
}
