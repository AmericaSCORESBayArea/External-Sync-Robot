//removes the view
db.district_2_system_registration_verify_participant_view.drop();

//creates a new view
db.createView("district_2_system_registration_verify_participant_view","district_2_registration_verify",

    // Pipeline
    [
      // Stage 1
      {
        $lookup: {
          "from" : "district_2_attendance_sheet_participants_view",
          "localField" : "participant.name",
          "foreignField" : "fullName",
          "as" : "matchingSystemRegistrations"
        }
      },

      // Stage 2
      {
        $unwind: {
          "path" : "$matchingSystemRegistrations",
          "includeArrayIndex" : "registrationIndex"
        }
      },

      // Stage 3
      {
        $match: {
          "registrationIndex" : 0.0
        }
      },

      // Stage 4
      {
        $project: {
          "_id" : 1.0,
          "browserDate" : 1.0,
          "participant" : 1.0,
          "formValues" : {
            "$arrayToObject" : "$formValues"
          }
        }
      },

    ]

);
