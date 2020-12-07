//removes the view
db.district_2_team_name_mapping_missing_view.drop();

//creates a new view
db.createView("district_2_team_name_mapping_missing_view","district_2_attendance_sheet_teams_view",

    // Pipeline
    [
      // Stage 1
      {
        $lookup: {
          "from" : "district_2_registration_team_to_system_team_mapping_view",
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