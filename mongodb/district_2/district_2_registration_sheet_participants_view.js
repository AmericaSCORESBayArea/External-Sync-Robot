//removes the view
db.district_2_registration_sheet_participants_view.drop();

//creates a new view
db.createView("district_2_registration_sheet_participants_view","district_2_registration_sheet_teams_view",

    // Pipeline
    [
      // Stage 1
      {
        $lookup: {
          "from" : "district_2_registration_team_to_system_team_mapping_view",
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
                    "$toLower" : "$participants.lastName"
                  }
                }
              },
              ".",
              {
                "$trim" : {
                  "input" : {
                    "$toLower" : "$participants.firstName"
                  }
                }
              }
            ]
          },
          "fullName" : {
            "$concat" : [
              "$participants.lastName",
              ", ",
              "$participants.firstName"
            ]
          },
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
