package de.micromata.pointcollector.repository;

import de.micromata.pointcollector.models.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long>
{
}
