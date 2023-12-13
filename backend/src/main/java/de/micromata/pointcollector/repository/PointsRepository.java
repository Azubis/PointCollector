package de.micromata.pointcollector.repository;

import de.micromata.pointcollector.models.PointUser;
import de.micromata.pointcollector.models.UserPoints;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PointsRepository extends JpaRepository<UserPoints, Long>
{
  //get map of business id and points for a user
  List<UserPoints> findByUserId(Long userId);

  List<UserPoints> findByUser(PointUser user);
}
