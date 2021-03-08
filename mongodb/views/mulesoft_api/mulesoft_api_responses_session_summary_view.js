db.mulesoft_api_responses_session_summary_view.drop();
db.createView("mulesoft_api_responses_session_summary_view","mulesoft_api_responses_session_view",

  // Pipeline
  [
    // Stage 1
    {
      $project: {
        "_id" : 1.0,
        "TeamSeasonName" : "$TeamSeasonName",
        "year" : {
          "$toString" : {
            "$year" : "$sessionDate"
          }
        }
      }
    },

    // Stage 2
    {
      $group: {
        "_id" : {
          "$concat" : [
            "$TeamSeasonName",
            "_",
            "$year"
          ]
        },
        "TeamSeasonName" : {
          "$first" : "$TeamSeasonName"
        },
        "year" : {
          "$first" : "$year"
        },
        "sessionCount" : {
          "$sum" : 1.0
        }
      }
    },

    // Stage 3
    {
      $sort: {
        "_id" : 1.0
      }
    },
  ]
);