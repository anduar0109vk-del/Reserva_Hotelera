package com.saas.controllers;

import com.saas.models.Employee;
import com.saas.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;

    @GetMapping
    public List<Employee> getEmployees() {
        return employeeRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Employee> createEmployee(@RequestBody Employee employee) {
        employee.setId(null);
        if (employee.getStatus() == null || employee.getStatus().isBlank()) {
            employee.setStatus("Activo");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeRepository.save(employee));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Long id, @RequestBody Employee employee) {
        return employeeRepository.findById(id)
                .map(existing -> {
                    existing.setFirstName(employee.getFirstName());
                    existing.setLastName(employee.getLastName());
                    existing.setEmail(employee.getEmail());
                    existing.setPosition(employee.getPosition());
                    existing.setDepartment(employee.getDepartment());
                    existing.setStatus(employee.getStatus());
                    existing.setSalary(employee.getSalary());
                    existing.setHireDate(employee.getHireDate());
                    return ResponseEntity.ok(employeeRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        if (!employeeRepository.existsById(id)) return ResponseEntity.notFound().build();
        employeeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}