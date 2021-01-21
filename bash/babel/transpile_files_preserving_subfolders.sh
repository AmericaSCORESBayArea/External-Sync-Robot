#!/usr/bin/env bash

ROOT_FOLDER="$1"
if [ -d "$ROOT_FOLDER" ]; then
  SOURCE_SUB_FOLDER="$2"
  cd "$ROOT_FOLDER" || exit
  if [ -d "$SOURCE_SUB_FOLDER" ]; then
    DESTINATION_SUB_FOLDER="$3"
    cd "$SOURCE_SUB_FOLDER" || exit
    FILE_COUNT=0
    ARRAY_OF_SUB_FOLDERS=()
    ARRAY_OF_FILE_NAMES=()
    while IFS=  read -r -d ''; do
      FILE_COUNT=$((FILE_COUNT + 1))
      CURRENT_SOURCE_RELATIVE_PATH="${REPLY:2}"
      IFS="/" read -ra ARRAY_OF_RELATIVE_SUB_FOLDERS <<< "$CURRENT_SOURCE_RELATIVE_PATH"
      CURRENT_SUB_FOLDERS=""
      CURRENT_FILE_NAME=""
      if [[ "${#ARRAY_OF_RELATIVE_SUB_FOLDERS[@]}" -gt 1 ]]; then
        for i in $(seq 0 $(("${#ARRAY_OF_RELATIVE_SUB_FOLDERS[@]}" - 1)))
          do
            if [[ i -lt $(("${#ARRAY_OF_RELATIVE_SUB_FOLDERS[@]}" - 1)) ]]; then
              CURRENT_SUB_FOLDERS+="/""${ARRAY_OF_RELATIVE_SUB_FOLDERS[$i]}"
            else
              CURRENT_FILE_NAME="${ARRAY_OF_RELATIVE_SUB_FOLDERS[$i]}"
            fi
          done
      else
        CURRENT_SUB_FOLDERS="/"
        CURRENT_FILE_NAME="$CURRENT_SOURCE_RELATIVE_PATH"
      fi
      ARRAY_OF_SUB_FOLDERS+=("$CURRENT_SUB_FOLDERS")
      ARRAY_OF_FILE_NAMES+=("$CURRENT_FILE_NAME")
    done < <(find . -name '*.js' -print0 | sort -z)
    # shellcheck disable=SC2207
    ARRAY_OF_UNIQUE_SUB_FOLDERS=( $(printf '%s\n' "${ARRAY_OF_SUB_FOLDERS[@]}" | sort -u) )
    echo "Found $FILE_COUNT files to transpile in ""${#ARRAY_OF_UNIQUE_SUB_FOLDERS[@]}" "unique sub folders..."
    for i in $(seq 0 $(("${#ARRAY_OF_UNIQUE_SUB_FOLDERS[@]}" - 1)))
      do
        CURRENT_BABEL_COMMAND_STRING="babel "
        for j in $(seq 0 $(("${#ARRAY_OF_SUB_FOLDERS[@]}" - 1)))
          do
            if [ "${ARRAY_OF_UNIQUE_SUB_FOLDERS[$i]}" == "${ARRAY_OF_SUB_FOLDERS[$j]}" ]; then
              CURRENT_BABEL_COMMAND_STRING+="$ROOT_FOLDER""/""$SOURCE_SUB_FOLDER""${ARRAY_OF_UNIQUE_SUB_FOLDERS[$i]}""/""${ARRAY_OF_FILE_NAMES[$j]}"" "
            fi
          done
        CURRENT_BABEL_COMMAND_STRING+="-d ""$ROOT_FOLDER""/""$DESTINATION_SUB_FOLDER""${ARRAY_OF_UNIQUE_SUB_FOLDERS[$i]}"
        eval "$CURRENT_BABEL_COMMAND_STRING"
      done
  else
    echo "Folder Not Found : Source Sub-Folder : $SOURCE_SUB_FOLDER. Please Check Before Continuing."
  fi
else
  echo "Folder Not Found : Root Full Folder Path : $ROOT_FOLDER. Please Check Before Continuing."
fi