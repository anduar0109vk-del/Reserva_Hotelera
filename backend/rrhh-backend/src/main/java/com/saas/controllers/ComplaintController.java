package com.saas.controllers;

import com.saas.models.Complaint;
import com.saas.models.Employee;
import com.saas.repository.ComplaintRepository;
import com.saas.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/complaints")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ComplaintController {
    private final ComplaintRepository complaintRepository;
    private final EmployeeRepository employeeRepository;

    @GetMapping
    public List<Complaint> getComplaints() {
        return complaintRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createComplaint(@RequestBody Map<String, String> request) {
        Employee employee = employeeRepository.findById(Long.valueOf(request.get("employeeId"))).orElse(null);
        if (employee == null) return ResponseEntity.badRequest().body("El empleado no existe.");
        Complaint complaint = Complaint.builder()
                .title(request.get("title"))
                .description(request.get("description"))
                .employee(employee)
                .status("Pendiente")
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(complaintRepository.save(complaint));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComplaint(@PathVariable Long id) {
        if (!complaintRepository.existsById(id)) return ResponseEntity.notFound().build();
        complaintRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
