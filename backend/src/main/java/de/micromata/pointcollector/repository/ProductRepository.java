package de.micromata.pointcollector.repository;

import de.micromata.pointcollector.models.Product;
import org.springframework.data.jpa.repository.JpaRepository;

interface ProductRepository extends JpaRepository<Product, Long>
{
}
