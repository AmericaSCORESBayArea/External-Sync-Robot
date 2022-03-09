db.district_team_season_name_mapping_view.drop();
db.createView("district_team_season_name_mapping_view","district_team_season_name_mapping",

  // Pipeline
  [
    // Stage 1
    {
      $project: {
        "_id" : 1.0,
        "district" : 1.0,
        "districtSystemTeamName" : 1.0,
        "teamSeasonName" : 1.0,
        "teamSeasonNameSplit_1" : {
          "$split" : [
            "$teamSeasonName",
            "-"
          ]
        }
      }
    },

    // Stage 2
    {
      $project: {
        "_id" : 1.0,
        "district" : 1.0,
        "districtSystemTeamName" : 1.0,
        "teamSeasonName" : 1.0,
        "teamSeasonNameSplit_1" : 1.0,
        "teamSeasonNameSplit_2" : {
          "$split" : [
            {
              "$arrayElemAt" : [
                "$teamSeasonNameSplit_1",
                1.0
              ]
            },
            " "
          ]
        }
      }
    },

    // Stage 3
    {
      $project: {
        "_id" : 1.0,
        "districtSystemTeamName" : 1.0,
        "teamSeasonName" : 1.0,
        "district" : 1.0,
        "year" : {
          "$trim" : {
            "input" : {
              "$arrayElemAt" : [
                "$teamSeasonNameSplit_2",
                0.0
              ]
            }
          }
        },
        "season" : {
          "$trim" : {
            "input" : {
              "$arrayElemAt" : [
                "$teamSeasonNameSplit_2",
                1.0
              ]
            }
          }
        }
      }
    },

    // Stage 4
    {
      $project: {
        "_id" : 1.0,
        "districtSystemTeamName" : 1.0,
        "teamSeasonName" : 1.0,
        "district" : 1.0,
        "year" : 1.0,
        "season" : 1.0,
        "districtSystemTeamName_year" : {
          "$concat" : [
            "$districtSystemTeamName",
            "_",
            "$year"
          ]
        },
        "districtSystemTeamName_season" : {
          "$concat" : [
            "$districtSystemTeamName",
            "_",
            "$season"
          ]
        },
        "districtSystemTeamName_season_year" : {
          "$concat" : [
            "$districtSystemTeamName",
            "_",
            "$season",
            "_",
            "$year"
          ]
        }
      }
    },
  ]
);