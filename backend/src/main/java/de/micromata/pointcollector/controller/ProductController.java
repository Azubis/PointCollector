package de.micromata.pointcollector.controller;

import de.micromata.pointcollector.dto.ProductDTO;
import de.micromata.pointcollector.models.Business;
import de.micromata.pointcollector.models.Product;
import de.micromata.pointcollector.repository.BusinessRepository;
import de.micromata.pointcollector.repository.ProductRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class ProductController
{

  private final BusinessRepository businessRepository;
  private final ProductRepository productRepository;

  public ProductController(BusinessRepository businessRepository,
    ProductRepository productRepository) {
    this.businessRepository = businessRepository;
    this.productRepository = productRepository;
  }

  @GetMapping("/products/{id}")
  public List<ProductDTO> getAll(@PathVariable Long id){
    if (id == null) {
      return null;
    }
    Optional<Business> business = businessRepository.findById(id);
    if (business.isEmpty()) {
      return null;
    }
    List<Product> products = productRepository.findByBusinessId(id);
    return products.stream().map(ProductDTO::new).collect(Collectors.toList());

  }

}