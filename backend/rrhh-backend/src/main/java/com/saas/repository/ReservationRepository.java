package com.saas.repository;

import com.saas.models.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    @Query("select count(r) > 0 from Reservation r where r.room.id = :roomId and r.status <> 'CANCELLED' and r.checkIn < :checkOut and r.checkOut > :checkIn")
    boolean existsOverlapping(@Param("roomId") Long roomId, @Param("checkIn") LocalDate checkIn, @Param("checkOut") LocalDate checkOut);
}
