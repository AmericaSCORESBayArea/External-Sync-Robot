//removes the view
db.district_1_system_team_enrollment_missing_no_registration.drop();

//creates a new view
db.createView("district_1_system_team_enrollment_missing_no_registration","district_1_system_team_enrollment_missing_view",
  [
    {
      $lookup: {
        "from" : "district_1_attendance_participant_missing_in_registration_view",
        "localField" : "_id",
        "foreignField" : "_id",
        "as" : "matchingMissingRegistrationSheet"
      }
    },
    {
      $match: {
        "matchingMissingRegistrationSheet.0" : {
          "$exists" : true
        }
      }
    },
  ]
);
