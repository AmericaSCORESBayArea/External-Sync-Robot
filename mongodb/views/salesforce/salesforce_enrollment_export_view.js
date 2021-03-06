db.salesforce_enrollment_export_view.drop();
db.createView("salesforce_enrollment_export_view","salesforce_enrollment_export",

  // Pipeline
  [
    // Stage 1
    {
      $lookup: {
        "from" : "district_team_season_name_mapping",
        "localField" : "TeamSeasonName",
        "foreignField" : "teamSeasonName",
        "as" : "teamNameMapping"
      }
    },

    // Stage 2
    {
      $unwind: {
        "path" : "$teamNameMapping",
        "includeArrayIndex" : "teamNameMappingIndex"
      }
    },

    // Stage 3
    {
      $match: {
        "teamNameMappingIndex" : 0.0
      }
    },

    // Stage 4
    {
      $project: {
        "_id" : 1.0,
        "fullName" : "$FullName",
        "district" : "$teamNameMapping.district",
        "teamSeasonName" : "$TeamSeasonName",
        "districtTeamName" : "$teamNameMapping.districtSystemTeamName",
        "fullName_teamSeasonName" : {
          "$concat" : [
            "$FullName",
            "_",
            "$TeamSeasonName"
          ]
        },
        "fullName_districtTeamName" : {
          "$concat" : [
            "$FullName",
            "_",
            "$teamNameMapping.districtSystemTeamName"
          ]
        }
      }
    },
  ]
);