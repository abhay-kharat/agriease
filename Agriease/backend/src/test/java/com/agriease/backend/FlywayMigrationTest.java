package com.agriease.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.jpa.hibernate.ddl-auto=none",
    "spring.flyway.enabled=true"
})
public class FlywayMigrationTest {

    @Value("${spring.flyway.baseline-on-migrate}")
    private String baselineOnMigrate;

    @Test
    void testFlywayPropertiesLoaded() {
        assertEquals("true", baselineOnMigrate, "Flyway baseline-on-migrate should be true");
    }
}
