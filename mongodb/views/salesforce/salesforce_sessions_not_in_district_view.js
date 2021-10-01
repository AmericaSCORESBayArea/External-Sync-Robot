db.salesforce_sessions_not_in_district_view.drop();
db.createView("salesforce_sessions_not_in_district_view","mulesoft_api_responses_view",

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
        "_id" : "$parameters.teamSeason",
        "sessions" : {
          "$push" : "$$ROOT"
        }
      }
    },

    // Stage 4
    {
      $lookup: {
        "from" : "district_team_season_name_mapping",
        "localField" : "_id",
        "foreignField" : "teamSeasonName",
        "as" : "matching_team_mapping"
      }
    },

    // Stage 5
    {
      $unwind: {
        "path" : "$matching_team_mapping",
        "includeArrayIndex" : "matching_team_mapping_index",
        "preserveNullAndEmptyArrays" : true
      }
    },

    // Stage 6
    {
      $match: {
        "matching_team_mapping_index" : {
          "$ne" : null
        },
        "matching_team_mapping.district" : {
          "$exists" : true
        }
      }
    },

    // Stage 7
    {
      $lookup: {
        "from" : "district_teams",
        "localField" : "matching_team_mapping.districtSystemTeamName",
        "foreignField" : "details.ActivityName",
        "as" : "matching_district_data"
      }
    },

    // Stage 8
    {
      $unwind: {
        "path" : "$matching_district_data"
      }
    },

    // Stage 9
    {
      $unwind: {
        "path" : "$sessions"
      }
    },

    // Stage 10
    {
      $lookup: {
        "from" : "district_team_schedule_date_formatted_view",
        "localField" : "sessions.data.SessionDate",
        "foreignField" : "dateConverted",
        "as" : "matchingSession"
      }
    },

    // Stage 11
    {
      $unwind: {
        "path" : "$matchingSession",
        "includeArrayIndex" : "matchingSession_index",
        "preserveNullAndEmptyArrays" : true
      }
    },

    // Stage 12
    {
      $match: {
        "matchingSession_index" : null
      }
    },

    // Stage 13
    {
      $project: {
        "_id" : {
          "$concat" : [
            "$matching_team_mapping.district",
            "_",
            "$matching_team_mapping.districtSystemTeamName",
            "_",
            "$sessions.data.SessionDate"
          ]
        },
        "district" : "$matching_team_mapping.district",
        "teamSeasonName" : "$matching_team_mapping.teamSeasonName",
        "districtSystemTeamName" : "$matching_team_mapping.districtSystemTeamName",
        "sessionDate" : "$sessions.data.SessionDate",
        "teamSeasonId" : "$sessions.data.TeamSeasonId",
        "sessionId" : "$sessions.data.SessionId",
        "sessionName" : "$sessions.data.SessionName",
        "activityID" : "$matching_district_data.details.ActivityID"
      }
    },
  ]
);