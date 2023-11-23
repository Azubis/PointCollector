package de.micromata.pointcollector.service;

import de.micromata.pointcollector.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import java.util.Date;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

  @Override
  public User loadUserByUsername(String username) throws UsernameNotFoundException {
    User user = new User("MaxMustermann","max@mustermann.com","password","Straße. 47","Kasselfornia",new Date());
    user.setPassword("$2a$12$2m8w5Qe6Rvz/vIHr10PJ1elbAHyZ9aw.dilt78TXSAaWercBM1Rp.");
    return user;
  }

}