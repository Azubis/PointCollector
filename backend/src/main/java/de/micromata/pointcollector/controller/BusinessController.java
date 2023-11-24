package de.micromata.pointcollector.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api")
public class BusinessController
{

  @GetMapping("/businesses")
  public List<Map<String, Object>> getAll() {
    List<Map<String, Object>> shopEntries = new ArrayList<>();

    // Hardcoded shop entries
    shopEntries.add(createShopEntry("Supermart", "123 Market Street", "10115", 54));
    shopEntries.add(createShopEntry("Electro World", "456 Tech Avenue", "10777", 89));
    shopEntries.add(createShopEntry("Fashion Trend", "789 Style Boulevard", "12103", 37));
    shopEntries.add(createShopEntry("Gadget Haven", "321 Tech Road", "13127", 62));
    shopEntries.add(createShopEntry("Book Nook", "567 Literary Lane", "10555", 43));
    shopEntries.add(createShopEntry("Sport Zone", "876 Active Avenue", "12045", 78));
    shopEntries.add(createShopEntry("Home Decor Emporium", "432 Interior Street", "10988", 56));
    shopEntries.add(createShopEntry("Pet Paradise", "789 Pet Park Place", "12233", 91));
    shopEntries.add(createShopEntry("Bakery Delights", "101 Sweet Street", "10876", 68));

    //randomize the order of the shops
    Collections.shuffle(shopEntries);

    return shopEntries;
  }

  private Map<String, Object> createShopEntry(String name, String address, String zipCode, int points) {
    Map<String, Object> shopEntry = new HashMap<>();
    shopEntry.put("name", name);
    shopEntry.put("address", address);
    shopEntry.put("zipCode", zipCode);
    shopEntry.put("points", points);
    return shopEntry;
  }

}
