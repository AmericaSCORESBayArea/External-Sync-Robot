//removes the view
db.district_2_system_attendance_sheet_teams_missing_view.drop();

//creates a new view
db.createView("district_2_system_attendance_sheet_teams_missing_view","extracted_tabular_data",

  // Pipeline
  [
    // Stage 1
    {
      $match: {
        "sourceId.2" : "scoresDISTRICT_2AttendanceData"
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
        "from" : "district_2_registration_team_to_system_team_mapping_view",
        "localField" : "_id",
        "foreignField" : "_id",
        "as" : "matchingDISTRICT_2TeamNameMapping"
      }
    },

    // Stage 5
    {
      $unwind: {
        "path" : "$matchingDISTRICT_2TeamNameMapping",
        "includeArrayIndex" : "teamNameIndex"
      }
    },

    // Stage 6
    {
      $match: {
        "teamNameIndex" : 0.0,
        "matchingDISTRICT_2TeamNameMapping.systemTeamName" : {
          "$ne" : ""
        }
      }
    },

    // Stage 7
    {
      $lookup: {
        "from" : "district_2_team_details_verify",
        "localField" : "matchingDISTRICT_2TeamNameMapping.systemTeamName",
        "foreignField" : "details.ActivityName",
        "as" : "matchingDISTRICT_2SystemTeamVerify"
      }
    },

    // Stage 8
    {
      $match: {
        "matchingDISTRICT_2SystemTeamVerify.0" : {
          "$exists" : false
        }
      }
    },
  ]
);