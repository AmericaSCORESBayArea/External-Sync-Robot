//removes the view
db.district_1_system_team_enrollment_missing_ready_to_add.drop();

//creates a new view
db.createView("district_1_system_team_enrollment_missing_ready_to_add","district_1_system_team_enrollment_missing_view",

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
          "$exists" : false
        }
      }
    },
    {
      $lookup: {
        "from" : "district_1_registration_sheet_participants_view",
        "localField" : "_id",
        "foreignField" : "_id",
        "as" : "matchingParticipantRegistration"
      }
    },
    {
      $unwind: {
        "path" : "$matchingParticipantRegistration",
        "includeArrayIndex" : "matchingParticipantIndex"
      }
    },
    {
      $match: {
        "matchingParticipantIndex" : 0.0
      }
    },
    {
      $project: {
        "_id" : 1.0,
        "fullName" : 1.0,
        "rootDoc" : "$matchingParticipantRegistration.participant"
      }
    }
  ]
);