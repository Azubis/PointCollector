package de.micromata.pointcollector;

import de.micromata.pointcollector.models.Business;
import de.micromata.pointcollector.models.PointUser;
import de.micromata.pointcollector.models.Product;
import de.micromata.pointcollector.models.UserPoints;
import de.micromata.pointcollector.repository.BusinessRepository;
import de.micromata.pointcollector.repository.PointsRepository;
import de.micromata.pointcollector.repository.ProductRepository;
import de.micromata.pointcollector.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Date;

@Component
public class DatabaseInit {

  private final BusinessRepository businessRepository;
  private final ProductRepository productRepository;
  private final UserRepository userRepository;
  private final PointsRepository pointsRepository;

  @Autowired
  public DatabaseInit(BusinessRepository businessRepository, ProductRepository productRepository,
    UserRepository userRepository,
    PointsRepository pointsRepository) {
    this.businessRepository = businessRepository;
    this.productRepository = productRepository;
    this.userRepository = userRepository;
    this.pointsRepository = pointsRepository;
  }

  @Transactional
  public void initializeTestData() {
    if (businessRepository.findAll().isEmpty()){    // Insert test data into the Business table
      Business business1 = new Business("Backhaus Markus", "Musterstrase 123", "12345", "assets/images/ec_baeckerei_mohr.png",
        "assets/images/business_image_0.png");
      Business business2 = new Business("Backwerk Schmidt", "Brotweg 456", "67890", "assets/images/ec_baeckerei_mohr.png",
        "assets/images/business_image_0.png");
      Business business3 = new Business("Konditorei Martin", "Kuchenstrase 789", "54321", "assets/images/ec_baeckerei_mohr.png",
        "assets/images/business_image_0.png");

      businessRepository.saveAll(Arrays.asList(business1, business2, business3));

      // Insert test data into the Product table
      Product product1 = new Product("assets/images/bigmac.jpeg", "BigMac", 1.0f, 1, 1, false, business1);
      Product product2 = new Product("assets/images/brezel.jpeg", "Brezel", 2.5f, 2, 2, true, business1);
      Product product3 = new Product("assets/images/schokobroetchen.jpeg", "Broetchen", 3.5f, 5, 5, true, business1);
      Product product4 = new Product("assets/images/coffee.jpeg", "Kaffee", 4.5f, 10, 10, true, business1);
      Product product5 = new Product("assets/images/kuchen.jpeg", "Kuchen", 5.5f, 15, 15, true, business1);

      productRepository.saveAll(Arrays.asList(product1, product2, product3, product4, product5));

      PointUser user = new PointUser("MaxMustermann","max@mustermann.com","password","Straße. 47","Kasselfornia",new Date());
      userRepository.save(user);

      UserPoints userPoints = new UserPoints(user, business1, 100);
      pointsRepository.save(userPoints);
    }
  }
}
