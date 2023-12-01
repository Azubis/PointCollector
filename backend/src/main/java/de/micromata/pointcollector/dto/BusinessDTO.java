package de.micromata.pointcollector.dto;

import lombok.*;

@Getter
@Setter
public class BusinessDTO {

  private Long id;
  public String name;
  public String address;
  public String zipCode;
  public int points;
  public String image;
  public String logo;


}