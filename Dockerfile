# ===== Etapa 1: Compilación =====
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copiamos solo el pom.xml y descargamos dependencias
COPY pom.xml .
RUN mvn dependency:go-offline

# Copiamos el resto del código fuente y compilamos
COPY src ./src
RUN mvn clean package -DskipTests

# ===== Etapa 2: Ejecución =====
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copiamos el .jar generado en la etapa de build
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
