db.salesforce_enrollment_export_view.drop();
db.createView("salesforce_enrollment_export_view","salesforce_enrollment_export",

  // Pipeline
  [
    // Stage 1
    {
      $group: {
        "_id" : "$TeamSeasonName",
        "sfEnrollments" : {
          "$push" : "$$ROOT"
        }
      }
    },

    // Stage 2
    {
      $lookup: {
        "from" : "district_team_season_name_mapping",
        "localField" : "_id",
        "foreignField" : "teamSeasonName",
        "as" : "teamNameMapping"
      }
    },

    // Stage 3
    {
      $unwind: {
        "path" : "$teamNameMapping",
        "includeArrayIndex" : "teamNameMappingIndex"
      }
    },

    // Stage 4
    {
      $match: {
        "teamNameMappingIndex" : 0.0
      }
    },

    // Stage 5
    {
      $unwind: {
        "path" : "$sfEnrollments"
      }
    },

    // Stage 6
    {
      $project: {
        "_id" : 1.0,
        "fullName" : "$sfEnrollments.FullName",
        "district" : "$teamNameMapping.district",
        "teamSeasonName" : "$sfEnrollments.TeamSeasonName",
        "districtTeamName" : "$teamNameMapping.districtSystemTeamName",
        "fullName_teamSeasonName" : {
          "$concat" : [
            "$sfEnrollments.FullName",
            "_",
            "$sfEnrollments.TeamSeasonName"
          ]
        },
        "fullName_districtTeamName" : {
          "$concat" : [
            "$sfEnrollments.FullName",
            "_",
            "$teamNameMapping.districtSystemTeamName"
          ]
        }
      }
    },
  ]
);