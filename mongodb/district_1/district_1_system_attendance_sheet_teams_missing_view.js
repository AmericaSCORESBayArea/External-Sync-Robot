//removes the view
db.district_1_system_attendance_sheet_teams_missing_view.drop();

//creates a new view
db.createView("district_1_system_attendance_sheet_teams_missing_view","extracted_tabular_data",

  // Pipeline
  [
    // Stage 1
    {
      $match: {
        "sourceId.2" : "scoresDISTRICT_1AttendanceData"
      }
    },

    // Stage 2
    {
      $unwind: {
        "path" : "$extractedData.data",
        "includeArrayIndex" : "dataIndex"
      }
    },

    // Stage 3
    {
      $group: {
        "_id" : "$extractedData.data.teamName"
      }
    },

    // Stage 4
    {
      $lookup: {
        "from" : "district_1_registration_team_to_system_team_mapping_view",
        "localField" : "_id",
        "foreignField" : "_id",
        "as" : "matchingDISTRICT_1TeamNameMapping"
      }
    },

    // Stage 5
    {
      $unwind: {
        "path" : "$matchingDISTRICT_1TeamNameMapping",
        "includeArrayIndex" : "teamNameIndex"
      }
    },

    // Stage 6
    {
      $match: {
        "teamNameIndex" : 0.0,
        "matchingDISTRICT_1TeamNameMapping.systemTeamName" : {
          "$ne" : ""
        }
      }
    },

    // Stage 7
    {
      $lookup: {
        "from" : "district_1_team_details_verify",
        "localField" : "matchingDISTRICT_1TeamNameMapping.systemTeamName",
        "foreignField" : "details.ActivityName",
        "as" : "matchingDISTRICT_1SystemTeamVerify"
      }
    },

    // Stage 8
    {
      $match: {
        "matchingDISTRICT_1SystemTeamVerify.0" : {
          "$exists" : false
        }
      }
    },
  ]
);