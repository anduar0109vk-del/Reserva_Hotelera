package com.saas.models;

import jakarta.persistence.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "rooms")
public class Room {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true) private String number;
    @Column(nullable = false) private String type;
    @Column(nullable = false) private Integer capacity;
    @Column(nullable = false) private java.math.BigDecimal pricePerNight;
    @Column(nullable = false) private String status;
}
