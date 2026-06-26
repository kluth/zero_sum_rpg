#!/bin/bash
set -e
export ANDROID_HOME=/home/matthias/project/erebus-protocol/android-sdk
export ANDROID_SDK_ROOT=/home/matthias/project/erebus-protocol/android-sdk
cd /home/matthias/project/erebus-protocol/frontend
"$@"
