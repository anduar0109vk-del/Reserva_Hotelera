package com.saas.controllers;

import com.saas.models.Employee;
import com.saas.models.Vacation;
import com.saas.repository.EmployeeRepository;
import com.saas.repository.VacationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/vacations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VacationController {
    private final VacationRepository vacationRepository;
    private final EmployeeRepository employeeRepository;

    @GetMapping
    public List<Vacation> getVacations() {
        return vacationRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createVacation(@RequestBody Map<String, String> request) {
        Employee employee = employeeRepository.findById(Long.valueOf(request.get("employeeId"))).orElse(null);
        if (employee == null) return ResponseEntity.badRequest().body("El empleado no existe.");
        Vacation vacation = Vacation.builder()
                .employee(employee)
                .startDate(LocalDate.parse(request.get("startDate")))
                .endDate(LocalDate.parse(request.get("endDate")))
                .requestedAt(LocalDate.now())
                .status("Pendiente")
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(vacationRepository.save(vacation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVacation(@PathVariable Long id) {
        if (!vacationRepository.existsById(id)) return ResponseEntity.notFound().build();
        vacationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
