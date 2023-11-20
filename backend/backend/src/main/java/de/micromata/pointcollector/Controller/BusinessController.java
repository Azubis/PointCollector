package de.micromata.pointcollector.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("api")
public class BusinessController
{

  @GetMapping("/businesses")
  public List<Map<String, Object>> getAllBusinesses() {
    List<Map<String, Object>> shopEntries = new ArrayList<>();

    // Hardcoded shop entries
    shopEntries.add(createShopEntry(1, "Supermart", "123 Market Street", "10115", 54));
    shopEntries.add(createShopEntry(2, "Electro World", "456 Tech Avenue", "10777", 89));
    shopEntries.add(createShopEntry(3, "Fashion Trend", "789 Style Boulevard", "12103", 37));
    shopEntries.add(createShopEntry(4, "Gadget Haven", "321 Tech Road", "13127", 62));
    shopEntries.add(createShopEntry(5, "Book Nook", "567 Literary Lane", "10555", 43));
    shopEntries.add(createShopEntry(6, "Sport Zone", "876 Active Avenue", "12045", 78));
    shopEntries.add(createShopEntry(7, "Home Decor Emporium", "432 Interior Street", "10988", 56));
    shopEntries.add(createShopEntry(8, "Pet Paradise", "789 Pet Park Place", "12233", 91));
    shopEntries.add(createShopEntry(9, "Bakery Delights", "101 Sweet Street", "10876", 68));

    //randomize the order of the shops
    Collections.shuffle(shopEntries);

    return shopEntries;
  }

  private Map<String, Object> createShopEntry(Integer id, String name, String address, String zipCode, int points) {
    Map<String, Object> shopEntry = new HashMap<>();
    shopEntry.put("id", id);
    shopEntry.put("name", name);
    shopEntry.put("address", address);
    shopEntry.put("zipCode", zipCode);
    shopEntry.put("city", "Berlin");
    shopEntry.put("points", points);
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
