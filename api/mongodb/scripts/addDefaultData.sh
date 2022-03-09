#!/usr/bin/env bash

PARENT_PATH=$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P )
# shellcheck disable=SC1090
source "$PARENT_PATH"/../../.env;

# shellcheck disable=SC1090
source "$PARENT_PATH"/run_mongo_commands_from_folder.sh;

runMongoCommandsFromFolder "$MONGODB_ADD_TO_COLLECTION_FOLDER"