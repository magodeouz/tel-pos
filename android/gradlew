#!/bin/bash
set -e

# Gradle wrapper for macOS/Linux

APP_BASE_NAME=${0##*/}
APP_HOME=$( cd "${APP_HOME:-.}" && pwd )

GRADLE_JAR="$APP_HOME/gradle/wrapper/gradle-wrapper.jar"
GRADLE_PROPERTIES="$APP_HOME/gradle/wrapper/gradle-wrapper.properties"

if [ ! -f "$GRADLE_JAR" ]; then
    echo "Downloading Gradle wrapper..."
    mkdir -p "$(dirname "$GRADLE_JAR")"
    curl -sL https://services.gradle.org/distributions/gradle-8.5-bin.zip -o /tmp/gradle-8.5-bin.zip
    unzip -q /tmp/gradle-8.5-bin.zip -d /tmp
    cp /tmp/gradle-8.5/lib/gradle-wrapper.jar "$GRADLE_JAR"
    rm -rf /tmp/gradle-8.5 /tmp/gradle-8.5-bin.zip
fi

# Run Gradle
exec java -classpath "$GRADLE_JAR" org.gradle.wrapper.GradleWrapperMain "$@"
