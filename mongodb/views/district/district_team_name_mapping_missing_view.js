db.district_team_name_mapping_missing_view.drop();
db.createView("district_team_name_mapping_missing_view","district_teams",

  // Pipeline
  [
    // Stage 1
    {
      $group: {
        "_id" : "$details.ActivityName",
        "ActivityID" : {
          "$addToSet" : "$details.ActivityID"
        },
        "district" : {
          "$first" : "$district"
        }
      }
    },

    // Stage 2
    {
      $lookup: {
        "from" : "district_team_season_name_mapping",
        "localField" : "_id",
        "foreignField" : "districtSystemTeamName",
        "as" : "matchingDistrictTeamName"
      }
    },

    // Stage 3
    {
      $match: {
        "matchingDistrictTeamName.0" : {
          "$exists" : false
        }
      }
    },

    // Stage 4
    {
      $sort: {
        "_id" : 1.0
      }
    },

    // Stage 5
    {
      $project: {
        "_id" : 1.0,
        "ActivityID" : {
          "$arrayElemAt" : [
            "$ActivityID",
            0.0
          ]
        },
        "district" : 1.0
      }
    },
  ]

);