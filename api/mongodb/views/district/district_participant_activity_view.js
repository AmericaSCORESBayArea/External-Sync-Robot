db.district_participant_activity_view.drop();
db.createView("district_participant_activity_view","district_teams",

  // Pipeline
  [
    // Stage 1
    {
      $unwind: {
        "path" : "$enrollment"
      }
    },

    // Stage 2
    {
      $project: {
        "_id" : 1.0,
        "participantId" : {
          "$concat" : [
            "$district",
            "_",
            "$enrollment.personId"
          ]
        },
        "personId" : "$enrollment.personId",
        "ActivityName" : "$details.ActivityName"
      }
    },

    // Stage 3
    {
      $lookup: {
        "from" : "district_participants_view",
        "localField" : "participantId",
        "foreignField" : "_id",
        "as" : "matchingParticipant"
      }
    },

    // Stage 4
    {
      $unwind: {
        "path" : "$matchingParticipant",
        "includeArrayIndex" : "participantIndex"
      }
    },

    // Stage 5
    {
      $project: {
        "_id" : "$participantId",
        "ActivityName" : 1.0,
        "participant" : "$matchingParticipant.participant.name",
        "status" : "$matchingParticipant.participant.status",
        "formValues" : "$matchingParticipant.formValues",
        "district" : "$matchingParticipant.district",
        "participantId" : "$personId",
        "participantNameSplit" : {
          "$split" : [
            "$matchingParticipant.participant.name",
            ","
          ]
        }
      }
    },

    // Stage 6
    {
      $project: {
        "_id" : 1.0,
        "ActivityName" : 1.0,
        "participant" : 1.0,
        "status" : 1.0,
        "formValues" : 1.0,
        "district" : 1.0,
        "participantId" : 1.0,
        "participantNameSplit" : 1.0,
        "fullName_districtTeamName" : {
          "$concat" : [
            {
              "$trim" : {
                "input" : {
                  "$arrayElemAt" : [
                    "$participantNameSplit",
                    1.0
                  ]
                }
              }
            },
            " ",
            {
              "$trim" : {
                "input" : {
                  "$arrayElemAt" : [
                    "$participantNameSplit",
                    0.0
                  ]
                }
              }
            },
            "_",
            "$ActivityName"
          ]
        }
      }
    },
  ]
);