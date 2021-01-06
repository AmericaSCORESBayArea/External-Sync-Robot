db.salesforce_session_dates_missing_view.drop();
db.createView("salesforce_session_dates_missing_view","district_team_schedule_date_formatted_view",

  // Pipeline
  [
    // Stage 1
    {
      $lookup: {
        "from" : "district_team_season_name_mapping",
        "localField" : "ActivityName",
        "foreignField" : "districtSystemTeamName",
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
      $project: {
        "_id" : 1.0,
        "ActivityName" : 1.0,
        "district" : 1.0,
        "ActivityID" : 1.0,
        "ServiceDateID" : 1.0,
        "SessionDateOriginal" : 1.0,
        "dateConverted" : 1.0,
        "teamSeasonName" : "$matchingTeamNameMapping.teamSeasonName"
      }
    },

    // Stage 5
    {
      $lookup: {
        "from" : "mulesoft_api_responses_team_season_id_view",
        "localField" : "teamSeasonName",
        "foreignField" : "_id",
        "as" : "matchingTeamSeason"
      }
    },

    // Stage 6
    {
      $unwind: {
        "path" : "$matchingTeamSeason",
        "includeArrayIndex" : "matchingTeamSeasonIndex"
      }
    },

    // Stage 7
    {
      $match: {
        "matchingTeamSeasonIndex" : 0.0
      }
    },

    // Stage 8
    {
      $project: {
        "_id" : 1.0,
        "ActivityID" : 1.0,
        "ActivityName" : 1.0,
        "district" : 1.0,
        "ServiceDateID" : 1.0,
        "SessionDateOriginal" : 1.0,
        "dateConverted" : 1.0,
        "teamSeasonName" : 1.0,
        "TeamSeasonId" : "$matchingTeamSeason.TeamSeasonId",
        "CoachSoccer" : "$matchingTeamSeason.CoachSoccer",
        "CoachWriting" : "$matchingTeamSeason.CoachWriting",
        "lookupSessionId" : {
          "$concat" : [
            "$teamSeasonName",
            "_",
            "$dateConverted"
          ]
        }
      }
    },

    // Stage 9
    {
      $lookup: {
        "from" : "mulesoft_api_responses_coach_sessions_view",
        "localField" : "lookupSessionId",
        "foreignField" : "_id",
        "as" : "matchingSession"
      }
    },

    // Stage 10
    {
      $unwind: {
        "path" : "$matchingSession",
        "includeArrayIndex" : "matchingSessionIndex",
        "preserveNullAndEmptyArrays" : true
      }
    },

    // Stage 11
    {
      $match: {
        "matchingSessionIndex" : null
      }
    },
  ]
);
