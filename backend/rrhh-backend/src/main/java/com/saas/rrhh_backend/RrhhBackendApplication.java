package com.saas.rrhh_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@EntityScan("com.saas.models")
@EnableJpaRepositories("com.saas.repository")
@SpringBootApplication(scanBasePackages = "com.saas")
public class RrhhBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(RrhhBackendApplication.class, args);
	}

}
