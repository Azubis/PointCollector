package de.micromata.pointcollector.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "user_points")
public class UserPoints
{
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "user_id")
  private PointUser user;

  @ManyToOne
  @JoinColumn(name = "business_id")
  private Business business;

  private int points;

  public UserPoints(PointUser user, Business business, int points)
  {
    this.user = user;
    this.business = business;
    this.points = points;
  }
  public UserPoints()
  {
  }
}
