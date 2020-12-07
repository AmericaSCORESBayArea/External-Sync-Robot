//removes the view
db.district_1_system_attendance_data_ready_to_push.drop();

//creates a new view
db.createView("district_1_system_attendance_data_ready_to_push","district_1_attendance_sheet_attendance_values_view",

  // Pipeline
  [
    // Stage 1
    {
      $match: {
        attended:"TRUE"
      }
    },

    // Stage 2
    {
      $lookup: {
        from: "district_1_system_team_enrollment_verify_participant_view",
        localField: "teamAndParticipant",
        foreignField: "_id",
        as: "matchingDISTRICT_1Registration"
      }
    },

    // Stage 3
    {
      $unwind: {
        path : "$matchingDISTRICT_1Registration",
        includeArrayIndex : "matchingDISTRICT_1RegistrationIndex"
      }
    },

    // Stage 4
    {
      $match: {
        matchingDISTRICT_1RegistrationIndex:0
      }
    },

    // Stage 5
    {
      $project: {
        "Person ID" : "$matchingDISTRICT_1Registration.participant.personId",
        "Activity Instance ID" : "$matchingDISTRICT_1Registration.participant.serviceId",
        "Attendance Date" : "$dateConverted"
      }
    },

    // Stage 6
    {
      $sort: {
        "Activity Instance ID" : 1,
        "Person ID" : 1,
        "Attendance Date" : 1
      }
    },
  ]
);