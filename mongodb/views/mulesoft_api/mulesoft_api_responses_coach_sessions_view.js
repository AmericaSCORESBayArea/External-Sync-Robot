db.mulesoft_api_responses_coach_sessions_view.drop();
db.createView("mulesoft_api_responses_coach_sessions_view","mulesoft_api_responses",

  // Pipeline
  [
    // Stage 1
    {
      $match: {
        "requestType" : "api/coach/[coachId]/teamseasons/[teamSeasonsId]/sessions"
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
      $project: {
        "_id" : {
          "$concat":[
            "$parameters.teamSeason",
            "_",
            "$data.SessionDate"
          ]
        },
        "SessionId" : "$data.SessionId",
        "teamSeasonName" : "$parameters.teamSeason",
        "requestDate" : 1.0,
        "CoachSoccer" : "$parameters.CoachSoccer",
        "CoachWriting" : "$parameters.CoachWriting",
        "TeamSeasonId" : "$data.TeamSeasonId",
        "SessionName" : "$data.SessionName",
        "SessionDate" : {
          "$toDate" : "$data.SessionDate"
        },
        "SessionTopic" : "$data.SessionTopic"
      }
    },

  ]
);
