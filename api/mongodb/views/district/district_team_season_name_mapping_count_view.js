db.district_team_season_name_mapping_count_view.drop();
db.createView("district_team_season_name_mapping_count_view","district_team_season_name_mapping",

  // Pipeline
  [
    // Stage 1
    {
      $group: {
        "_id" : "$teamSeasonName",
        "districtTeams" : {
          "$push" : "$$ROOT"
        }
      }
    },

    // Stage 2
    {
      $project: {
        "_id" : 1.0,
        "districtTeams" : 1.0,
        "districtTeamCount" : {
          "$cond" : {
            "if" : {
              "$isArray" : "$districtTeams"
            },
            "then" : {
              "$size" : "$districtTeams"
            },
            "else" : "-1"
          }
        }
      }
    },

    // Stage 3
    {
      $sort: {
        "districtTeamCount" : -1.0,
        "districtTeams" : 1.0
      }
    },
  ]
);