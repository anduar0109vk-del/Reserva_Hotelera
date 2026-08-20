package com.saas.controllers;

import com.saas.models.*;
import com.saas.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/hotel")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class HotelController {
    private final GuestRepository guestRepository;
    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;

    @GetMapping("/guests")
    public List<Guest> guests() { return guestRepository.findAll(); }

    @PostMapping("/guests")
    public ResponseEntity<Guest> createGuest(@RequestBody Guest guest) {
        guest.setId(null);
        if (guest.getPhone() == null || guest.getPhone().isBlank()) guest.setPhone("No registrado");
        return ResponseEntity.status(HttpStatus.CREATED).body(guestRepository.save(guest));
    }

    @GetMapping("/rooms")
    public List<Room> rooms() { return roomRepository.findAll(); }

    @PostMapping("/rooms")
    public ResponseEntity<Room> createRoom(@RequestBody Room room) {
        room.setId(null);
        if (room.getStatus() == null || room.getStatus().isBlank()) room.setStatus("AVAILABLE");
        return ResponseEntity.status(HttpStatus.CREATED).body(roomRepository.save(room));
    }

    @GetMapping("/reservations")
    public List<Reservation> reservations() { return reservationRepository.findAll(); }

    @PostMapping("/reservations")
    public ResponseEntity<?> createReservation(@RequestBody Map<String, String> request) {
        Guest guest = guestRepository.findById(Long.valueOf(request.get("guestId"))).orElse(null);
        Room room = roomRepository.findById(Long.valueOf(request.get("roomId"))).orElse(null);
        if (guest == null || room == null) return ResponseEntity.badRequest().body("El huésped o la habitación no existe.");
        LocalDate checkIn = LocalDate.parse(request.get("checkIn"));
        LocalDate checkOut = LocalDate.parse(request.get("checkOut"));
        if (!checkOut.isAfter(checkIn)) return ResponseEntity.badRequest().body("La salida debe ser posterior a la entrada.");
        if (reservationRepository.existsOverlapping(room.getId(), checkIn, checkOut)) return ResponseEntity.status(HttpStatus.CONFLICT).body("La habitación ya está reservada en esas fechas.");
        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);
        Reservation reservation = Reservation.builder().guest(guest).room(room).checkIn(checkIn).checkOut(checkOut).status("CONFIRMED").totalAmount(room.getPricePerNight().multiply(BigDecimal.valueOf(nights))).notes(request.get("notes")).build();
        return ResponseEntity.status(HttpStatus.CREATED).body(reservationRepository.save(reservation));
    }

    @PutMapping("/reservations/{id}/cancel")
    public ResponseEntity<?> cancelReservation(@PathVariable Long id) {
        return reservationRepository.findById(id).map(reservation -> { reservation.setStatus("CANCELLED"); return ResponseEntity.ok(reservationRepository.save(reservation)); }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
