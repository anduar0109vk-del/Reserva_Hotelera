package com.saas.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "reservations")
public class Reservation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "guest_id", nullable = false) private Guest guest;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "room_id", nullable = false) private Room room;
    @Column(nullable = false) private LocalDate checkIn;
    @Column(nullable = false) private LocalDate checkOut;
    @Column(nullable = false) private String status;
    @Column(nullable = false) private java.math.BigDecimal totalAmount;
    private String notes;
}
