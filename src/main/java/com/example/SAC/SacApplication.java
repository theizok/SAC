package com.example.SAC;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class SacApplication {

	public static void main(String[] args) {
		SpringApplication.run(SacApplication.class, args);
	}

}
