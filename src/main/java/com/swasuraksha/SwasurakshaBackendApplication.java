package com.swasuraksha;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SwasurakshaBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SwasurakshaBackendApplication.class, args);
	}

}
