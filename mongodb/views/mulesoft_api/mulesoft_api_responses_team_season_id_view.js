db.mulesoft_api_responses_team_season_id_view.drop();
db.createView("mulesoft_api_responses_team_season_id_view","mulesoft_api_responses",

  // Pipeline
  [
    // Stage 1
    {
      $match: {
        "requestType" : "api/coach/[coachId]/all"
      }
    },

    // Stage 2
    {
      $unwind: {
        "path" : "$data"
      }
    },

    // Stage 3
    {
      $group: {
        "_id" : "$data.TeamSeasonName",
        "TeamSeasonId" : {
          "$first" : "$data.TeamSeasonId"
        },
        "CoachSoccer" : {
          "$first" : "$data.CoachSoccer"
        },
        "CoachWriting" : {
          "$first" : "$data.CoachWriting"
        }
      }
    },

    // Stage 4
    {
      $sort: {
        "_id" : 1.0
      }
    },
  ]
);