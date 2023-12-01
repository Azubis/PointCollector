package de.micromata.pointcollector.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "product")
public class Product
{
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "business_id")
  @JsonIgnoreProperties("products") // Break the circular reference
  private Business business;

  private String image;
  private String name;
  private float price;
  private int pointsGain;
  @JsonProperty("isRedeemable")
  private int redeemCost;
  private boolean isRedeemable;

  public Product(String image, String name, float price, int pointsGain, int redeemCost, boolean isRedeemable, Business business) {
    this.image = image;
    this.name = name;
    this.price = price;
    this.pointsGain = pointsGain;
    this.redeemCost = redeemCost;
    this.isRedeemable = isRedeemable;
    this.business = business;
  }

  public Product()
  {

  }
}
