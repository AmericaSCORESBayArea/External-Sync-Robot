//removes the view
db.district_2_system_team_enrollment_missing_view.drop();

//creates a new view
db.createView("district_2_system_team_enrollment_missing_view","district_2_attendance_sheet_participants_view",

    // Pipeline
    [
      // Stage 1
      {
        $lookup: {
          "from" : "district_2_system_team_enrollment_verify_participant_view",
          "localField" : "_id",
          "foreignField" : "_id",
          "as" : "matchingTeamEnrollment"
        }
      },

      // Stage 2
      {
        $match: {
          "matchingTeamEnrollment.0" : {
            "$exists" : false
          }
        }
      },

    ]
);
