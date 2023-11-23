
# Verwende das offizielle Maven Image als Basisimage, um das Backend im Container zu bauen
FROM maven:3.8.4 AS builder

# Setze das Arbeitsverzeichnis im Builder-Container
WORKDIR /build

# Kopiere den gesamten Inhalt des lokalen "backend"-Verzeichnisses in den Builder-Container
COPY ./backend /build

# Baue das Spring Boot-Projekt im Container
RUN mvn -f /build/pom.xml clean package

# Basis-Image mit Java 17
FROM openjdk:17-jdk

# Setze das Arbeitsverzeichnis im Produktionscontainer
WORKDIR /PointCollector

# Kopiere die gebaute JAR-Datei aus dem Builder-Container in den Produktionscontainer
COPY --from=builder /build/target/*.jar /PointCollector/PointCollector.jar

# Exponiere den Port, auf dem die Anwendung läuft (Standardport für Spring Boot ist 8080)
EXPOSE 8080

# Befehl zum Ausführen der Anwendung beim Start des Containers
CMD ["java", "-jar", "app.jar"]