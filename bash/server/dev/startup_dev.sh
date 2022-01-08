#!/usr/bin/env bash

# navigate to project root directory
cd ../../../

# startup mongo
cd bash/mongodb/ || exit
#
#MONGODB_ROOT_FOLDER="db"
#MONGODB_LOG_FOLDER="$MONGODB_ROOT_FOLDER/log"
#MONGODB_DATA_FOLDER="$MONGODB_ROOT_FOLDER/data"
#
#BL_NEEDED_FOLDER_UPDATE=0
#
#if [ ! -d "$MONGODB_ROOT_FOLDER" ]; then
#  BL_NEEDED_FOLDER_UPDATE=1
#  echo "Initializing MongoDB Root Folder: $MONGODB_ROOT_FOLDER"
#  mkdir -p "$MONGODB_ROOT_FOLDER"
#fi
#if [ ! -d "$MONGODB_LOG_FOLDER" ]; then
#  BL_NEEDED_FOLDER_UPDATE=1
#  echo "Initializing MongoDB Log Folder: $MONGODB_LOG_FOLDER"
#  mkdir -p "$MONGODB_LOG_FOLDER"
#fi
#if [ ! -d "$MONGODB_DATA_FOLDER" ]; then
#  BL_NEEDED_FOLDER_UPDATE=1
#  echo "Initializing MongoDB Data Folder: $MONGODB_DATA_FOLDER"
#  mkdir -p "$MONGODB_DATA_FOLDER"
#
#fi

(mongod --config mongod.conf) &

#if (( BL_NEEDED_FOLDER_UPDATE == 1 )); then
#
#  echo "Initializing MongoDB Indices and Views..."
#
#  #creates indices
#  ./createAllIndices.sh
#
#  #creates views
#  ./createAllViews.sh
#
#fi
#
#cd ../../ || exit
#
## startup node DEV server with nodemon file change listener
#cd api || exit
#(npm run start) &
#cd .. || exit