#! /usr/bin/env bash

PARENT_PATH=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)
# shellcheck disable=SC1090
source "$PARENT_PATH"/../../node-commands/.env;

getCurrentDateTime() {

  SYSTEM_TYPE=$(uname)

  if [[ $SYSTEM_TYPE == "$SYSTEM_NAME_MAC" ]]; then
    gdate "$DATE_FORMAT_ISO8601" -u
    return 1;
  fi

  if [[ $SYSTEM_TYPE == "$SYSTEM_NAME_LINUX" ]]; then
    date "$DATE_FORMAT_ISO8601" -u
    return 1;
  fi

  return 0;
}