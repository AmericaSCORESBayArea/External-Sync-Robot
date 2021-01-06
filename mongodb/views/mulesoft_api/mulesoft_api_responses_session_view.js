db.mulesoft_api_responses_session_view.drop();
db.createView("mulesoft_api_responses_session_view","mulesoft_api_responses",

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
      $group: {
        "_id" : "$data.SessionId",
        "sessionId" : {
          "$first" : "$data.SessionId"
        },
        "teamSeasonId" : {
          "$first" : "$data.TeamSeasonId"
        },
        "sessionName" : {
          "$first" : "$data.SessionName"
        },
        "sessionDate" : {
          "$first" : {
            "$toDate" : "$data.SessionDate"
          }
        },
        "sessionTopic" : {
          "$first" : "$data.SessionTopic"
        },
        "mulesoftAPIrequestDate" : {
          "$first" : "$requestDate"
        },
        "httpAPIRequestId" : {
          "$first" : "$_id"
        }
      }
    },

    // Stage 4
    {
      $lookup: {
        "from" : "mulesoft_api_responses_team_season_id_view",
        "localField" : "teamSeasonId",
        "foreignField" : "TeamSeasonId",
        "as" : "matchingTeamSeasonMapping"
      }
    },

    // Stage 5
    {
      $unwind: {
        "path" : "$matchingTeamSeasonMapping",
        "includeArrayIndex" : "matchingTeamSeasonMappingIndex"
      }
    },

    // Stage 6
    {
      $match: {
        "matchingTeamSeasonMappingIndex" : 0.0
      }
    },

    // Stage 7
    {
      $project: {
        "_id" : 1.0,
        "sessionId" : 1.0,
        "teamSeasonId" : 1.0,
        "sessionName" : 1.0,
        "sessionDate" : 1.0,
        "sessionTopic" : 1.0,
        "teamSeasonName" : 1.0,
        "mulesoftAPIRequestDate" : 1.0,
        "httpAPIRequestId" : 1.0,
        "TeamSeasonName" : "$matchingTeamSeasonMapping._id",
        "TeamSeasonId" : "$matchingTeamSeasonMapping.TeamSeasonId",
        "CoachSoccer" : "$matchingTeamSeasonMapping.CoachSoccer",
        "CoachWriting" : "$matchingTeamSeasonMapping.CoachWriting"
      }
    },

    // Stage 8
    {
      $sort: {
        "TeamSeasonName" : 1.0,
        "sessionDate" : 1.0
      }
    }
  ]
);