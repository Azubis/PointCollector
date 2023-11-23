# Basis-Image mit Java 17
FROM openjdk:17-jdk

# Argument für die Quelldatei des Builds
ARG JAR_FILE=./backend/target/*.jar

# Kopieren der JAR-Datei ins Image
COPY ${JAR_FILE} app.jar

# Befehl zum Starten der Anwendung
ENTRYPOINT ["java","-jar","/app.jar"]

EXPOSE 8080
