# Configura temporalmente JAVA_HOME para usar Java 25 (que soporta Java 21)
$env:JAVA_HOME="C:\Users\Angel\AppData\Local\Programs\Eclipse Adoptium\jdk-25.0.3.9-hotspot"

# Ejecuta Spring Boot
.\mvnw.cmd clean spring-boot:run
