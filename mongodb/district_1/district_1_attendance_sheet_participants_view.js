//removes the view
db.district_1_attendance_sheet_participants_view.drop();

//creates a new view
db.createView("district_1_attendance_sheet_participants_view","district_1_attendance_sheet_teams_view",

  // Pipeline
  [
    // Stage 1
    {
      $lookup: {
        "from" : "district_1_registration_team_to_system_team_mapping_view",
        "localField" : "_id",
        "foreignField" : "_id",
        "as" : "matchingTeamNameMapping"
      }
    },

    // Stage 2
    {
      $unwind: {
        "path" : "$matchingTeamNameMapping",
        "includeArrayIndex" : "matchingTeamNameMappingIndex"
      }
    },

    // Stage 3
    {
      $match: {
        "matchingTeamNameMappingIndex" : 0.0
      }
    },

    // Stage 4
    {
      $unwind: {
        "path" : "$participants",
        "includeArrayIndex" : "participantIndex"
      }
    },

    // Stage 5
    {
      $project: {
        "_id" : {
          "$concat" : [
            {
              "$trim" : {
                "input" : {
                  "$toLower" : "$matchingTeamNameMapping.systemTeamName"
                }
              }
            },
            ".",
            {
              "$trim" : {
                "input" : {
                  "$toLower" : "$participants.fullName"
                }
              }
            }
          ]
        },
        "fullName" : 1.0,
        "participant" : "$participants",
        "participantIndex" : "$participantIndex"
      }
    },

    // Stage 6
    {
      $sort: {
        "_id" : 1.0
      }
    },

  ]

);