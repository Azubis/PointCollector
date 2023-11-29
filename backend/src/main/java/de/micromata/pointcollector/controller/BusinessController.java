package de.micromata.pointcollector.controller;

import de.micromata.pointcollector.dto.BusinessDTO;
import de.micromata.pointcollector.models.Business;
import de.micromata.pointcollector.models.PointUser;
import de.micromata.pointcollector.models.UserPoints;
import de.micromata.pointcollector.repository.BusinessRepository;
import de.micromata.pointcollector.repository.PointsRepository;
import de.micromata.pointcollector.repository.ProductRepository;
import de.micromata.pointcollector.repository.UserRepository;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

  private final BusinessRepository businessRepository;
  private final PointsRepository pointsRepository;
  private final UserRepository userRepository;



  public BusinessController(BusinessRepository businessRepository, PointsRepository pointsRepository, UserRepository userRepository) {
    this.businessRepository = businessRepository;
    this.pointsRepository = pointsRepository;
    this.userRepository = userRepository;

  }

  @GetMapping("/businesses")
  public List<BusinessDTO> getAll() {
    //get all businesses from database
    List<Business> businesses = businessRepository.findAll();
    List<BusinessDTO> businessDTOS = new ArrayList<>();

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (!(authentication instanceof AnonymousAuthenticationToken)) {
      String currentUserName = authentication.getName();
      //find user by name
      PointUser user = userRepository.findByName(currentUserName);
      //get points from user
      List<UserPoints> userPoints = pointsRepository.findByUser(user);
      //set points for business based on user
      for (Business business : businesses) {
        for (UserPoints userPoint : userPoints) {
          if (userPoint.getBusiness().getId().equals(business.getId())) {
            BusinessDTO businessDTO = new BusinessDTO();
            businessDTO.setId(business.getId());
            businessDTO.setName(business.getName());
            businessDTO.setAddress(business.getAddress());
            businessDTO.setZipCode(business.getZipCode());
            businessDTO.setPoints(userPoint.getPoints());
            businessDTOS.add(businessDTO);
          }
        }
      }
    }

    return businessDTOS;
  }

  @PostMapping("/create/businesses")
  public Business createBusiness(@RequestBody Business business) {
    //check if business is valid
    if (business.getName() == null || business.getAddress() == null || business.getZipCode() == null) {
      return null;
    }

    businessRepository.save(business);
    return business;

  }

}
