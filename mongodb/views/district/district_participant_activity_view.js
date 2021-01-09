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
        "participantId" : "$personId"
      }
    },
  ]
);