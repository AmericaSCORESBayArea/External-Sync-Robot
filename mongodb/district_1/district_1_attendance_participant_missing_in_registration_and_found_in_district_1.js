//removes the view
db.district_1_attendance_participant_missing_in_registration_and_found_in_district_1.drop();

//creates a new view
db.createView("district_1_attendance_participant_missing_in_registration_and_found_in_district_1","district_1_attendance_participant_missing_in_registration_view",

    // Pipeline
    [
      // Stage 1
      {
        $lookup: {
          "from" : "district_1_system_team_enrollment_verify_participant_view",
          "localField" : "_id",
          "foreignField" : "_id",
          "as" : "district_1Reference"
        }
      },

      // Stage 2
      {
        $match: {
          "district_1Reference.0" : {
            "$exists" : true
          }
        }
      },

      // Stage 3
      {
        $sort: {
          "_id" : 1.0
        }
      },

    ]

);