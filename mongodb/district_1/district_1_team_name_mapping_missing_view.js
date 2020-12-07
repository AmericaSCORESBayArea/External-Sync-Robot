//removes the view
db.district_1_team_name_mapping_missing_view.drop();

//creates a new view
db.createView("district_1_team_name_mapping_missing_view","district_1_attendance_sheet_teams_view",

    // Pipeline
    [
      // Stage 1
      {
        $lookup: {
          "from" : "district_1_registration_team_to_system_team_mapping_view",
          "localField" : "_id",
          "foreignField" : "_id",
          "as" : "matchingTeamName"
        }
      },

      // Stage 2
      {
        $match: {
          "$or" : [
            {
              "matchingTeamName.0" : {
                "$exists" : false
              }
            }
          ]
        }
      },

      // Stage 3
      {
        $group: {
          "_id" : "$_id"
        }
      },

      // Stage 4
      {
        $sort: {
          "_id" : 1.0
        }
      },

    ]

);