package de.micromata.pointcollector.repository;

import de.micromata.pointcollector.models.PointUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<PointUser, Long>
{

  PointUser findByName(String currentUserName);
}
