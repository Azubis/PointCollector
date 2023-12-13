package de.micromata.pointcollector.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import de.micromata.pointcollector.models.Product;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductDTO
{
  private String image;
  private String name;
  private float price;
  private int pointsGain;
  private int redeemCost;
  @JsonProperty("isRedeemable")
  private boolean isRedeemable;

  public ProductDTO(Product product)
  {
    this.image = product.getImage();
    this.name = product.getName();
    this.price = product.getPrice();
    this.pointsGain = product.getPointsGain();
    this.redeemCost = product.getRedeemCost();
    this.isRedeemable = product.isRedeemable();
  }
}
