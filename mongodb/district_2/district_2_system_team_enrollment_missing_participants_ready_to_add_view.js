//removes the view
db.district_2_system_team_enrollment_missing_participants_ready_to_add_view.drop();

//creates a new view
db.createView("district_2_system_team_enrollment_missing_participants_ready_to_add_view","district_2_attendance_sheet_teams_view",

  // Pipeline
  [
    // Stage 1
    {
      $unwind: {
        "path" : "$participants"
      }
    },

    // Stage 2
    {
      $lookup: {
        "from" : "district_2_registration_team_to_system_team_mapping_view",
        "localField" : "participants.teamName",
        "foreignField" : "_id",
        "as" : "matchingTeamNameMapping"
      }
    },

    // Stage 3
    {
      $unwind: {
        "path" : "$matchingTeamNameMapping",
        "includeArrayIndex" : "matchingTeamNameMappingIndex"
      }
    },

    // Stage 4
    {
      $match: {
        "matchingTeamNameMappingIndex" : 0.0
      }
    },

    // Stage 5
    {
      $project: {
        "_id" : {
          "$concat" : [
            {
              "$trim" : {
                "input" : {
                  "$toLower" : "$matchingTeamNameMapping.systemTeamName"
                }
              }
            },
            ".",
            {
              "$trim" : {
                "input" : {
                  "$toLower" : "$participants.lastName"
                }
              }
            },
            ".",
            {
              "$trim" : {
                "input" : {
                  "$toLower" : "$participants.firstName"
                }
              }
            }
          ]
        },
        "fullName" : {
          "$concat" : [
            "$participants.lastName",
            ", ",
            "$participants.firstName"
          ]
        },
        "teamName" : "$matchingTeamNameMapping.systemTeamName"
      }
    },

    // Stage 6
    {
      $lookup: {
        "from" : "district_2_system_team_enrollment_verify_participant_view",
        "localField" : "_id",
        "foreignField" : "_id",
        "as" : "matchingDISTRICT_2TeamEnrollment"
      }
    },

    // Stage 7
    {
      $match: {
        "matchingDISTRICT_2TeamEnrollment.0" : {
          "$exists" : false
        }
      }
    },

    // Stage 8
    {
      $group: {
        "_id" : "$teamName",
        "missingDISTRICT_2SystemEnrollmentParticipants" : {
          "$push" : "$$ROOT"
        }
      }
    },

    // Stage 9
    {
      $lookup: {
        "from" : "district_2_team_details_verify",
        "localField" : "_id",
        "foreignField" : "details.ActivityName",
        "as" : "matchingTeamDetails"
      }
    },

    // Stage 10
    {
      $unwind: {
        "path" : "$matchingTeamDetails",
        "includeArrayIndex" : "matchingTeamDetailsIndex"
      }
    },

    // Stage 11
    {
      $match: {
        "matchingTeamDetailsIndex" : 0.0
      }
    },

    // Stage 12
    {
      $unwind: {
        "path" : "$missingDISTRICT_2SystemEnrollmentParticipants"
      }
    },

    // Stage 13
    {
      $lookup: {
        "from" : "district_2_registration_verify",
        "localField" : "missingDISTRICT_2SystemEnrollmentParticipants.fullName",
        "foreignField" : "participant.name",
        "as" : "matchingDISTRICT_2ParticipantDetails"
      }
    },

    // Stage 14
    {
      $unwind: {
        "path" : "$matchingDISTRICT_2ParticipantDetails"
      }
    },

    // Stage 15
    {
      $group: {
        "_id" : "$_id",
        "teamId" : {
          "$first" : "$matchingTeamDetails.details.ActivityID"
        },
        "registered_participants" : {
          "$push" : {
            "participantId" : "$matchingDISTRICT_2ParticipantDetails.participant.id",
            "fullName" : "$matchingDISTRICT_2ParticipantDetails.participant.name"
          }
        }
      }
    },
  ]
);