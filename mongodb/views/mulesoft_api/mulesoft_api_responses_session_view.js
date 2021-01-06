db.mulesoft_api_responses_session_view.drop();
db.createView("mulesoft_api_responses_session_view","mulesoft_api_responses",

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
      $unwind: {
        "path" : "$data.Sessions"
      }
    },

    // Stage 4
    {
      $group: {
        "_id" : "$data.Sessions.SessionId",
        "sessionId" : {
          "$first" : "$data.Sessions.SessionId"
        },
        "teamSeasonId" : {
          "$first" : "$data.Sessions.TeamSeasonId"
        },
        "sessionName" : {
          "$first" : "$data.Sessions.SessionName"
        },
        "sessionDate" : {
          "$first" : {
            "$toDate" : "$data.Sessions.SessionDate"
          }
        },
        "sessionTopic" : {
          "$first" : "$data.Sessions.SessionTopic"
        },
        "teamSeasonName" : {
          "$first" : "$data.TeamSeasonName"
        },
        "mulesoftAPIrequestDate" : {
          "$first" : "$requestDate"
        },
        "httpAPIRequestId" : {
          "$first" : "$_id"
        }
      }
    },
  ]
);