package de.micromata.pointcollector.repository;

import de.micromata.pointcollector.models.UserPoints;
import org.springframework.data.jpa.repository.JpaRepository;

interface PointsRepository extends JpaRepository<UserPoints, Long>
{
}
