db.mulesoft_api_responses_enrollments_found_view.drop();
db.createView("mulesoft_api_responses_enrollments_found_view","mulesoft_api_responses",

  // Pipeline
  [
    // Stage 1
    {
      $match: {
        "requestType" : "api/enrollments?teamSeasonId=[TeamSeasonId]"
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
      $replaceRoot: {
        "newRoot" : "$data"
      }
    },

    // Stage 4
    {
      $project: {
        "_id" : "$EnrollmentId",
        "EnrollmentId" : 1.0,
        "EnrollmentName" : 1.0,
        "TeamSeasonId" : 1.0,
        "StudentId" : 1.0,
        "StudentName" : 1.0,
        "FirstName" : 1.0,
        "LastName" : 1.0,
        "Birthdate" : 1.0,
        "Gender" : 1.0,
        "Ethnicity" : 1.0,
        "ZipCode" : 1.0,
        "TeamSeasonId_StudentId" : {
          "$concat" : [
            "$TeamSeasonId",
            "_",
            "$StudentId"
          ]
        }
      }
    },

    // Stage 5
    {
      $lookup: {
        "from" : "mulesoft_api_responses_team_season_id_view",
        "localField" : "TeamSeasonId",
        "foreignField" : "TeamSeasonId",
        "as" : "matchingTeamSeasonId"
      }
    },

    // Stage 6
    {
      $unwind: {
        "path" : "$matchingTeamSeasonId",
        "includeArrayIndex" : "matchingTeamSeasonIdIndex"
      }
    },

    // Stage 7
    {
      $match: {
        "matchingTeamSeasonIdIndex" : 0.0
      }
    },

    // Stage 8
    {
      $lookup: {
        "from" : "district_team_season_name_mapping_view",
        "localField" : "matchingTeamSeasonId._id",
        "foreignField" : "teamSeasonName",
        "as" : "matchingDistrictTeam"
      }
    },

    // Stage 9
    {
      $unwind: {
        "path" : "$matchingDistrictTeam",
        "includeArrayIndex" : "matchingDistrictTeamIndex"
      }
    },

    // Stage 10
    {
      $match: {
        "matchingDistrictTeamIndex" : 0.0
      }
    },

    // Stage 11
    {
      $project: {
        "_id" : "$EnrollmentId",
        "EnrollmentId" : 1.0,
        "EnrollmentName" : 1.0,
        "TeamSeasonId" : 1.0,
        "StudentId" : 1.0,
        "StudentName" : 1.0,
        "FirstName" : 1.0,
        "LastName" : 1.0,
        "Birthdate" : 1.0,
        "Gender" : 1.0,
        "Ethnicity" : 1.0,
        "ZipCode" : 1.0,
        "TeamSeasonId_StudentId" : 1.0,
        "districtTeamName" : "$matchingDistrictTeam.districtSystemTeamName",
        "teamSeasonName" : "$matchingDistrictTeam.teamSeasonName",
        "district" : "$matchingDistrictTeam.district",
        "year" : "$matchingDistrictTeam.year",
        "season" : "$matchingDistrictTeam.season"
      }
    }
  ]
);