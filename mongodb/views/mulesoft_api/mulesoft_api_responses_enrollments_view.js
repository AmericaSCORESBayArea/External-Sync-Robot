db.mulesoft_api_responses_enrollments_view.drop();
db.createView("mulesoft_api_responses_enrollments_view","mulesoft_api_responses",

  // Pipeline
  [
    // Stage 1
    {
      $match: {
        "requestType" : "/api/contacts?dcyfId&firstName=[FirstName]&lastName=[LastName]&trimmed=true&doubleEncoded=false"
      }
    },

    // Stage 2
    {
      $unwind: {
        "path" : "$data",
        "includeArrayIndex" : "dataIndex"
      }
    },

    // Stage 3
    {
      $match: {
        "dataIndex" : 0.0
      }
    },

    // Stage 4
    {
      $lookup: {
        "from" : "district_participant_activity_view",
        "localField" : "parameters.participantId",
        "foreignField" : "participantId",
        "as" : "matchingDistrictParticipant"
      }
    },

    // Stage 5
    {
      $unwind: {
        "path" : "$matchingDistrictParticipant",
        "includeArrayIndex" : "matchingDistrictParticipantIndex"
      }
    },

    // Stage 6
    {
      $match: {
        "matchingDistrictParticipantIndex" : 0.0
      }
    },

    // Stage 7
    {
      $lookup: {
        "from" : "district_team_season_name_mapping",
        "localField" : "matchingDistrictParticipant.ActivityName",
        "foreignField" : "districtSystemTeamName",
        "as" : "matchingTeamNameMapping"
      }
    },

    // Stage 8
    {
      $unwind: {
        "path" : "$matchingTeamNameMapping",
        "includeArrayIndex" : "matchingTeamNameMappingIndex"
      }
    },

    // Stage 9
    {
      $match: {
        "matchingTeamNameMappingIndex" : 0.0
      }
    },

    // Stage 10
    {
      $lookup: {
        "from" : "mulesoft_api_responses_team_season_id_view",
        "localField" : "matchingTeamNameMapping.teamSeasonName",
        "foreignField" : "_id",
        "as" : "matchingSFTeam"
      }
    },

    // Stage 11
    {
      $unwind: {
        "path" : "$matchingSFTeam",
        "includeArrayIndex" : "matchingSFTeamIndex"
      }
    },

    // Stage 12
    {
      $match: {
        "matchingSFTeamIndex" : 0.0
      }
    },

    // Stage 13
    {
      $project: {
        "_id" : "$_id",
        "requestDate" : 1.0,
        "districtFields" : "$matchingDistrictParticipant",
        "salesforceData" : "$data",
        "studentId" : "$data.Id",
        "teamSeasonId" : "$matchingSFTeam.TeamSeasonId"
      }
    },
  ]
);