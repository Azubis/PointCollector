package de.micromata.pointcollector.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class test {
  @GetMapping("/")
  public String index() {
    return "Greetings from Spring Boot!";
  }
}
