//removes the view
db.district_2_attendance_participant_missing_in_registration_view.drop();

//creates a new view
db.createView("district_2_attendance_participant_missing_in_registration_view","district_2_attendance_sheet_participants_view",

    // Pipeline
    [
      // Stage 1
      {
        $lookup: {
          "from" : "district_2_registration_sheet_participants_view",
          "localField" : "_id",
          "foreignField" : "_id",
          "as" : "matching_registrations"
        }
      },

      // Stage 2
      {
        $match: {
          "matching_registrations.0" : {
            "$exists" : false
          }
        }
      },

      // Stage 3
      {
        $project: {
          "_id" : 1.0,
          "participant" : 1.0,
          "participantIndex" : 1.0
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