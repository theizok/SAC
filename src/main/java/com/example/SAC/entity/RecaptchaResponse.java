package com.example.SAC.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.util.List;

public class RecaptchaResponse {
    @Getter
    private boolean success;

    @JsonProperty("error-codes")
    private List<String> errorCodes;

}
