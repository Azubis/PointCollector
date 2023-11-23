# Basis-Image mit Java 17
FROM openjdk:17-jdk

# Setze das Arbeitsverzeichnis im Container
WORKDIR /PointCollector-Backend

# Kopiere die JAR-Datei aus dem lokalen "backend" Verzeichnis in den Container
COPY ./backend/target/*.jar /app/app.jar

# Exponiere den Port, auf dem die Anwendung läuft (Standardport für Spring Boot ist 8080)
EXPOSE 8080

# Befehl zum Ausführen der Anwendung beim Start des Containers
CMD ["java", "-jar", "app.jar"]