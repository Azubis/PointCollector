package de.micromata.pointcollector.models;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "business")
public class Business {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  public String name;
  public String address;
  public String zipCode;
  public String image;
  public String logo;

  @OneToMany(mappedBy = "business", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Product> products;

  public Business(String name, String address, String zipCode, String image, String logo) {
    this.name = name;
    this.address = address;
    this.zipCode = zipCode;
    this.image = image;
    this.logo = logo;
  }

  public Business()
  {

  }
}
