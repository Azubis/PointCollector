package de.micromata.pointcollector.Controller;

import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;


@CrossOrigin
@RestController
@RequestMapping("api")
public class BusinessController {

  Logger LOGGER = Logger.getLogger(BusinessController.class.getName());

  @GetMapping("/businesses")
  public List<Map<String, Object>> getAllBusinesses() {
    List<Map<String, Object>> shopEntries = new ArrayList<>();

    // Hardcoded shop entries
    shopEntries.add(createShopEntry(1, "Supermart", "123 Market Street", "10115"));
    shopEntries.add(createShopEntry(2, "Electro World", "456 Tech Avenue", "10777"));
    shopEntries.add(createShopEntry(3, "Fashion Trend", "789 Style Boulevard", "12103"));
    shopEntries.add(createShopEntry(4, "Gadget Haven", "321 Tech Road", "13127"));
    shopEntries.add(createShopEntry(5, "Book Nook", "567 Literary Lane", "10555"));
    shopEntries.add(createShopEntry(6, "Sport Zone", "876 Active Avenue", "12045"));
    shopEntries.add(createShopEntry(7, "Home Decor Emporium", "432 Interior Street", "10988"));
    shopEntries.add(createShopEntry(8, "Pet Paradise", "789 Pet Park Place", "12233"));
    shopEntries.add(createShopEntry(9, "Bakery Delights", "101 Sweet Street", "10876"));

    //randomize the order of the shops
    Collections.shuffle(shopEntries);

    LOGGER.info("Returning " + shopEntries.size() + " shops");

    return shopEntries;
  }

  private Map<String, Object> createShopEntry(Integer id, String name, String address, String zipCode) {
    Map<String, Object> shopEntry = new HashMap<>();
    shopEntry.put("id", id);
    shopEntry.put("name", name);
    shopEntry.put("address", address);
    shopEntry.put("zipCode", zipCode);
    shopEntry.put("city", "Berlin");
    return shopEntry;
  }

  @GetMapping("/products/{businessId}")
  public List<Map<String, Object>> getAllProducts(@PathVariable("businessId") int businessId) {
    if (businessId != 0) {
      List<Map<String, Object>> productEntries = new ArrayList<>();

      productEntries.add(createProductEntry("assets/images/coffee.jpeg", "Coffee", 2.5, 2, 2, true));
      productEntries.add(createProductEntry("assets/images/schokobroetchen.jpeg", "pain au chocolat", 3.5, 5, 5, true));
      productEntries.add(createProductEntry("assets/images/brezel.jpeg", "Brezel", 1.0, 1, 1, true));
      productEntries.add(createProductEntry("assets/images/kuchen.jpeg", "Kuchen", 6.0, 10, 10, true));
      productEntries.add(createProductEntry("assets/images/bigmac.jpeg", "BigMac", 12.0, 5, 5, false));

      return productEntries;
    }
    return Collections.emptyList();
  }

  private Map<String, Object> createProductEntry(String image, String name, Double price, int pointsGain, int redeemCost,
    boolean isRedeemable) {
    Map<String, Object> productEntry = new HashMap<>();
    productEntry.put("image", image);
    productEntry.put("name", name);
    productEntry.put("price", price);
    productEntry.put("pointsGain", pointsGain);
    productEntry.put("redeemCost", redeemCost);
    productEntry.put("isRedeemable", isRedeemable);
    return productEntry;
  }

}
