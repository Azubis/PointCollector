package de.micromata.pointcollector.repository;

import de.micromata.pointcollector.models.Business;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BusinessRepository extends JpaRepository<Business, Long>
{
}
