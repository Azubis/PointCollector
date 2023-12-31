package de.micromata.pointcollector.service;

import de.micromata.pointcollector.JwtUtil;
import de.micromata.pointcollector.dto.UserLoginDTO;
import de.micromata.pointcollector.models.PointUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service

public class UserService {

  @Autowired
  private AuthenticationManager authenticationManager;

  @Autowired
  private JwtUtil jwtTokenUnit;

  @Autowired
  private UserDetailsServiceImpl userDetailsService;

  public ResponseEntity loginMachCheck(UserLoginDTO userLoginDTO){
    Authentication authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(userLoginDTO.getIdentifier(), userLoginDTO.getPassword()));

    SecurityContextHolder.getContext().setAuthentication(authentication);

    final PointUser user = userDetailsService.loadUserByUsername(userLoginDTO.getIdentifier());
    final String jwt = jwtTokenUnit.generateJwtToken(user.getUsername());
    return ResponseEntity.ok(new AuthenticationResponse(jwt));
  }

}
