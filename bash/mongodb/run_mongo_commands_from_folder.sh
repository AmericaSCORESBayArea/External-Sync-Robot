#!/usr/bin/env bash

PARENT_PATH=$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P )

# shellcheck disable=SC1090
source "$PARENT_PATH"/../../node-commands/.env;

# shellcheck disable=SC1090
source "$PARENT_PATH"/../datetime/current_date_time.sh;

runMongoCommandsFromFolder() {

  echo "Starting MongoDB Run From Folder Function"
  getCurrentDateTime
  echo "Folder: $1"
  if [ -d "$1" ]; then
    cd "$1" || exit;
    COUNT=0

    MONGODB_CONNECTION_URI="mongodb://""$MONGO_IP"":""$MONGO_PORT""/""$MONGO_DATABASE"

    MONGO_AUTH_STRING=""
    if [ -n "$MONGO_USERNAME" ]; then
      if [ -n "$MONGO_PASSWORD" ]; then
        MONGO_AUTH_STRING+=" -u ""$MONGO_USERNAME"" -p ""$MONGO_PASSWORD"" "
        if [ -n "$MONGO_AUTHDB" ]; then
          MONGO_AUTH_STRING+="--authenticationDatabase=""$MONGO_AUTHDB"" "
        fi
      fi
    fi

    while IFS=  read -r -d ''; do
      COUNT=$((COUNT + 1))
      echo "Running command [$COUNT]: $REPLY"

      MONGO_COMMAND_STRING="mongo $MONGODB_CONNECTION_URI""$MONGO_AUTH_STRING"" ""$REPLY"

      eval "$MONGO_COMMAND_STRING"

      echo "Done with command $REPLY"
      getCurrentDateTime
      echo "$REPLY"
    done < <(find . -name '*.js' -print0 | sort -z);

    echo "Done with $COUNT command(s)"
    getCurrentDateTime
    echo ""

  else
    echo "Error with MongodDB Run From Folder Function - cannot locate folder $1";
    return 0;
  fi
    return 1;
}