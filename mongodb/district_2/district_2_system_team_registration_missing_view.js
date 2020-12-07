//removes the view
db.district_2_system_team_registration_missing_view.drop();

//creates a new view
db.createView("district_2_system_team_registration_missing_view","district_2_attendance_sheet_participants_view",

    // Pipeline
    [
      // Stage 1
      {
        $lookup: {
          "from" : "district_2_system_registration_verify_participant_view",
          "localField" : "fullName",
          "foreignField" : "participant.name",
          "as" : "matchingParticipant"
        }
      },

      // Stage 2
      {
        $match: {
          "matchingParticipant.0" : {
            "$exists" : false
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
