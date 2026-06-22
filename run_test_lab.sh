#!/bin/bash
set -e

# Compile the app and test APKs under zero_sum_android/
echo "=== Step 1: Compiling app and test APKs ==="
cd zero_sum_android
./gradlew assembleDebug assembleAndroidTest
cd ..

# Run the instrumentation tests in Firebase Test Lab
echo "=== Step 2: Running Firebase Test Lab ==="
set +e
GCLOUD_OUTPUT=$(/home/matthias/google-cloud-sdk/bin/gcloud firebase test android run \
  --type instrumentation \
  --app zero_sum_android/app/build/outputs/apk/debug/app-debug.apk \
  --test zero_sum_android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk \
  --device model=MediumPhone.arm,version=34,locale=en,orientation=portrait \
  --project zero-sum-rpg-2026 \
  --timeout 10m \
  --directories-to-pull /sdcard/Android/data/com.zerosum.rpg/files/screenshots 2>&1)
GCLOUD_EXIT_CODE=$?
set -e

echo "$GCLOUD_OUTPUT"

# Parse the GCS results bucket URL
echo "=== Step 3: Parsing GCS results bucket URL ==="
BROWSER_URL=$(echo "$GCLOUD_OUTPUT" | grep -o "https://console.developers.google.com/storage/browser/[^]]*" | head -n 1)
if [ -n "$BROWSER_URL" ]; then
    GCS_URL=$(echo "$BROWSER_URL" | sed 's|https://console.developers.google.com/storage/browser/|gs://|')
else
    GCS_URL=$(echo "$GCLOUD_OUTPUT" | grep -oE "gs://[a-zA-Z0-9._/-]+" | head -n 1)
fi

if [ -z "$GCS_URL" ]; then
    # Fallback search if the pattern differs slightly
    GCS_URL=$(echo "$GCLOUD_OUTPUT" | grep -o "gs://[^ ]*" | head -n 1 | tr -d '[]()')
fi

if [ -z "$GCS_URL" ]; then
    echo "Error: Could not parse GCS bucket URL from gcloud output."
    exit 1
fi

GCS_URL="${GCS_URL%/}"
echo "Parsed GCS URL: $GCS_URL"

# Create the cloud_simulation_logs directory if it does not exist
mkdir -p /home/matthias/project/zero_sum_rpg/cloud_simulation_logs/

# Recursively download all PNG screenshots from the results GCS bucket
echo "=== Step 4: Downloading screenshots from GCS ==="
/home/matthias/google-cloud-sdk/bin/gsutil -m cp "${GCS_URL}/**/*.png" /home/matthias/project/zero_sum_rpg/cloud_simulation_logs/

echo "=== Execution Complete ==="
