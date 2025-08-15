# Etapa 1: Compilación
FROM maven:3.9.6-eclipse-temurin-23 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Ejecución
FROM openjdk:23-jdk-slim
WORKDIR /app
COPY --from=build /app/target/SAC-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
