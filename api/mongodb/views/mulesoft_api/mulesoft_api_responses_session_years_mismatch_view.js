db.mulesoft_api_responses_session_years_mismatch_view.drop();
db.createView("mulesoft_api_responses_session_years_mismatch_view","mulesoft_api_responses_session_view",

  // Pipeline
  [
    // Stage 1
    {
      $project: {
        "_id" : 1.0,
        "sessionId" : 1.0,
        "teamSeasonId" : 1.0,
        "sessionDate" : 1.0,
        "teamSeasonName" : "$TeamSeasonName",
        "sessionYear" : {
          "$toString" : {
            "$year" : "$sessionDate"
          }
        },
        "TeamSeasonNameSplit" : {
          "$split" : [
            "$TeamSeasonName",
            "-"
          ]
        }
      }
    },

    // Stage 2
    {
      $project: {
        "_id" : 1.0,
        "sessionId" : 1.0,
        "teamSeasonId" : 1.0,
        "sessionYear" : 1.0,
        "teamSeasonName" : 1.0,
        "sessionDate" : 1.0,
        "teamSeasonNameYearSplit" : {
          "$split" : [
            {
              "$arrayElemAt" : [
                "$TeamSeasonNameSplit",
                -1.0
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
        "sessionId" : 1.0,
        "teamSeasonId" : 1.0,
        "sessionYear" : 1.0,
        "teamSeasonName" : 1.0,
        "sessionDate" : 1.0,
        "teamSeasonNameYear" : {
          "$trim" : {
            "input" : {
              "$arrayElemAt" : [
                "$teamSeasonNameYearSplit",
                0.0
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
        "sessionId" : 1.0,
        "teamSeasonId" : 1.0,
        "sessionYear" : 1.0,
        "teamSeasonName" : 1.0,
        "sessionDate" : 1.0,
        "teamSeasonNameYear" : 1.0,
        "yearsMatch" : {
          "$cond" : [
            {
              "$eq" : [
                "$sessionYear",
                "$teamSeasonNameYear"
              ]
            },
            true,
            false
          ]
        }
      }
    },

    // Stage 5
    {
      $match: {
        "yearsMatch" : false
      }
    },
  ]
)