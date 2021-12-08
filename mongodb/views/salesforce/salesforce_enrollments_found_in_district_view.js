db.salesforce_enrollments_found_in_district_view.drop();
db.createView("salesforce_enrollments_found_in_district_view","mulesoft_api_responses_enrollments_found_view",

  // Pipeline

  [
    // Stage 1
    {
      $match: {
        "district" : {
          "$ne" : null
        }
      }
    },

    // Stage 2
    {
      $addFields: {
        "registrationLookup" : {
          "$concat" : [
            "$district",
            "_",
            "$LastName",
            ", ",
            "$FirstName"
          ]
        },
        "enrollmentLookup" : {
          "$concat" : [
            "$district",
            "_",
            "$districtTeamName",
            "_",
            "$LastName",
            ", ",
            "$FirstName"
          ]
        }
      }
    },

    // Stage 3
    {
      $lookup: {
        "from" : "district_team_enrollment_participant_view",
        "localField" : "enrollmentLookup",
        "foreignField" : "_id",
        "as" : "matching_district_enrollment"
      }
    },

    // Stage 4
    {
      $unwind: {
        "path" : "$matching_district_enrollment",
        "includeArrayIndex" : "matching_district_enrollment_index",
        "preserveNullAndEmptyArrays" : true
      }
    },

    // Stage 5
    {
      $match: {
        "matching_district_enrollment_index" : 0
      }
    },

    // Stage 6
    {
      $lookup: {
        "from" : "district_participants_view",
        "localField" : "registrationLookup",
        "foreignField" : "district_participant",
        "as" : "matchingParticipant"
      }
    },

    // Stage 7
    {
      $unwind: {
        "path" : "$matchingParticipant",
        "includeArrayIndex" : "matchingParticipantIndex"
      }
    },

    // Stage 8
    {
      $match: {
        "matchingParticipantIndex" : 0.0
      }
    },

    // Stage 9
    {
      $group: {
        "_id" : {
          "$concat" : [
            "$district",
            "_",
            "$districtTeamName"
          ]
        },
        "districtTeamName" : {
          "$first" : "$districtTeamName"
        },
        "district" : {
          "$first" : "$district"
        },
        "participant" : {
          "$push" : {
            "participantDistrictId" : "$matchingParticipant.participant.id",
            "participantName" : "$matchingParticipant.participant.name",
            "participantSFEnrollmentId":"$EnrollmentId",
            "participantSFStudentId":"$StudentId",
            "participantSFTeamSeasonId":"$TeamSeasonId"
          }
        }
      }
    },

    // Stage 10
    {
      $lookup: {
        "from" : "district_teams",
        "localField" : "districtTeamName",
        "foreignField" : "details.ActivityName",
        "as" : "matchingDistrictDetails"
      }
    },

    // Stage 11
    {
      $unwind: {
        "path" : "$matchingDistrictDetails",
        "includeArrayIndex" : "matchingDistrictDetailsIndex"
      }
    },

    // Stage 12
    {
      $match: {
        "matchingDistrictDetailsIndex" : 0.0
      }
    },

    // Stage 13
    {
      $project: {
        "_id" : 1.0,
        "district" : 1.0,
        "districtTeamName" : 1.0,
        "registered_participant" : "$participant",
        "teamId" : "$matchingDistrictDetails.details.ActivityID",
        "hasSchedules" : {
          "$cond" : [
            {
              "$gt" : [
                {
                  "$size" : "$matchingDistrictDetails.schedule"
                },
                0.0
              ]
            },
            true,
            false
          ]
        }
      }
    },

    // Stage 14
    {
      $match: {
        "hasSchedules" : true
      }
    },

    // Stage 15
    {
      $unwind: {
        "path" : "$registered_participant",
        "includeArrayIndex" : "registered_participantIndex"
      }
    }
  ]
);