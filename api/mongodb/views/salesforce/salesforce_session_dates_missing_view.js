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
        "path" : "$matchingTeamNameMapping"
      }
    },

    // Stage 3
    {
      $project: {
        "_id" : 1.0,
        "ActivityName" : 1.0,
        "district" : 1.0,
        "ActivityID" : 1.0,
        "ServiceDateID" : 1.0,
        "SessionDateOriginal" : 1.0,
        "dateConverted" : 1.0,
        "sessionYear" : 1.0,
        "sessionMonth" : 1.0,
        "matchingTeamNameMapping" : 1.0,
        "TeamSeasonNameSplit" : {
          "$split" : [
            "$matchingTeamNameMapping.teamSeasonName",
            "-"
          ]
        }
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
        "sessionYear" : 1.0,
        "sessionMonth" : 1.0,
        "matchingTeamNameMapping" : 1.0,
        "TeamSeasonNameSplit" : 1.0,
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

    // Stage 5
    {
      $project: {
        "_id" : 1.0,
        "ActivityName" : 1.0,
        "district" : 1.0,
        "ActivityID" : 1.0,
        "ServiceDateID" : 1.0,
        "SessionDateOriginal" : 1.0,
        "dateConverted" : 1.0,
        "sessionYear" : 1.0,
        "sessionMonth" : 1.0,
        "matchingTeamNameMapping" : 1.0,
        "TeamSeasonNameSplit" : 1.0,
        "teamSeasonNameYearSplit" : 1.0,
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

    // Stage 6
    {
      $project: {
        "_id" : 1.0,
        "ActivityName" : 1.0,
        "district" : 1.0,
        "ActivityID" : 1.0,
        "ServiceDateID" : 1.0,
        "SessionDateOriginal" : 1.0,
        "dateConverted" : 1.0,
        "sessionYear" : 1.0,
        "sessionMonth" : 1.0,
        "matchingTeamNameMapping" : 1.0,
        "TeamSeasonNameSplit" : 1.0,
        "teamSeasonNameYearSplit" : 1.0,
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

    // Stage 7
    {
      $match: {
        "yearsMatch" : true
      }
    },

    // Stage 8
    {
      $project: {
        "_id" : 1.0,
        "ActivityName" : 1.0,
        "district" : 1.0,
        "ActivityID" : 1.0,
        "ServiceDateID" : 1.0,
        "SessionDateOriginal" : 1.0,
        "dateConverted" : 1.0,
        "sessionYear" : 1.0,
        "teamSeasonNameYear" : 1.0,
        "teamSeasonName" : "$matchingTeamNameMapping.teamSeasonName"
      }
    },

    // Stage 9
    {
      $lookup: {
        "from" : "mulesoft_api_responses_team_season_id_view",
        "localField" : "teamSeasonName",
        "foreignField" : "_id",
        "as" : "matchingTeamSeason"
      }
    },

    // Stage 10
    {
      $unwind: {
        "path" : "$matchingTeamSeason",
        "includeArrayIndex" : "matchingTeamSeasonIndex"
      }
    },

    // Stage 11
    {
      $match: {
        "matchingTeamSeasonIndex" : 0.0
      }
    },

    // Stage 12
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
        "sessionYear" : 1.0,
        "teamSeasonNameYear" : 1.0,
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

    // Stage 13
    {
      $lookup: {
        "from" : "mulesoft_api_responses_coach_sessions_view",
        "localField" : "lookupSessionId",
        "foreignField" : "_id",
        "as" : "matchingSession"
      }
    },

    // Stage 14
    {
      $unwind: {
        "path" : "$matchingSession",
        "includeArrayIndex" : "matchingSessionIndex",
        "preserveNullAndEmptyArrays" : true
      }
    },

    // Stage 15
    {
      $match: {
        "matchingSessionIndex" : null
      }
    },
  ]
)