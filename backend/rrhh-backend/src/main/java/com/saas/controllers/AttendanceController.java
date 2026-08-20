package com.saas.controllers;

import com.saas.models.Attendance;
import com.saas.models.Employee;
import com.saas.repository.AttendanceRepository;
import com.saas.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AttendanceController {
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    @GetMapping
    public List<Attendance> getAttendance() {
        return attendanceRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createAttendance(@RequestBody Map<String, String> request) {
        Employee employee = employeeRepository.findById(Long.valueOf(request.get("employeeId"))).orElse(null);
        if (employee == null) return ResponseEntity.badRequest().body("El empleado no existe.");
        Attendance attendance = Attendance.builder()
                .employee(employee)
                .date(LocalDate.parse(request.get("date")))
                .checkIn(parseTime(request.get("checkIn")))
                .checkOut(parseTime(request.get("checkOut")))
                .status(request.getOrDefault("status", "Presente"))
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(attendanceRepository.save(attendance));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long id) {
        if (!attendanceRepository.existsById(id)) return ResponseEntity.notFound().build();
        attendanceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private LocalTime parseTime(String value) {
        return value == null || value.isBlank() ? null : LocalTime.parse(value);
    }
}
