#
# Build stage
#
FROM maven:3.8.2-openjdk-17 AS build
WORKDIR /app
COPY backend/ .
RUN mvn clean package -DskipTests
RUN mv $(find /app -name '*.jar' -type f) /app/demo.jar

#
# Package stage
#
FROM openjdk:17-jdk-slim
COPY --from=build /app/demo.jar .
EXPOSE 8080
ENTRYPOINT ["java", "-Dspring.profiles.active=prod","-jar", "demo.jar"]