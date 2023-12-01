package de.micromata.pointcollector;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class PointCollectorApplication {

  public static void main(String[] args) {
    SpringApplication.run(PointCollectorApplication.class, args);

  }
  @Bean
  public CommandLineRunner dataLoader(DatabaseInit databaseInit) {
    return args -> databaseInit.initializeTestData();
  }

}
