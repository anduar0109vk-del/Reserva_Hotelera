# HR SaaS Core System

Bienvenido al sistema **SaaS de Recursos Humanos** desarrollado con Spring Boot (Java 17) y React (Vite + Tailwind CSS).
Este proyecto implementa la arquitectura moderna solicitada y cumple con los tópicos de Control de Versiones, CI/CD, despliegues y contenedores.

## Características Principales
- **Arquitectura de Microservicios simulada** con Backend y Frontend separados.
- **Seguridad**: Autenticación con JWT (JSON Web Tokens).
- **Múltiples Roles**: Admin, Empleado, Reclutador, Contabilidad.
- **Modo Oscuro / Claro**: Interfaz con Theme Context integrado para cambiar instantáneamente la paleta de colores a colores oscuros o clásicos (Tailwind).
- **Libro de Reclamos**: Módulo de Quejas y Reclamos integrado.
- **CI/CD Integrado**: Validaciones automáticas en GitHub Actions.

## Instrucciones de Inicio Rápido
1. Asegúrate de tener XAMPP y arranca **MySQL**.
2. Crea una base de datos vacía llamada `saas_rrhh`.
3. Ve a `backend/rrhh-backend` y ejecuta: `mvnw spring-boot:run`. El backend expondrá sus servicios en el puerto predeterminado y creará las tablas automáticamente mediante Hibernate/JPA.
4. Ve a `frontend`, ejecuta `npm install` y luego `npm run dev`. Accede a la URL indicada (usualmente `http://localhost:5173`).

## Guía de Usuario
Consulta el archivo [GuiaUsuario.md](./GuiaUsuario.md) para aprender a usar el sistema.
