db.mulesoft_api_responses_participants_not_found_view.drop();
db.createView("mulesoft_api_responses_participants_not_found_view","district_participant_activity_view",

  // Pipeline
  [
    // Stage 1
    {
      $lookup: {
        "from" : "mulesoft_api_responses_participants_view",
        "localField" : "participantId",
        "foreignField" : "participantId_district",
        "as" : "matchingMulesoftResponse"
      }
    },

    // Stage 2
    {
      $unwind: {
        "path" : "$matchingMulesoftResponse",
        "includeArrayIndex" : "matchingMulesoftResponseIndex",
        "preserveNullAndEmptyArrays" : true
      }
    },

    // Stage 3
    {
      $match: {
        "matchingMulesoftResponseIndex" : null
      }
    },

    // Stage 4
    {
      $group: {
        "_id" : "$_id",
        "ActivityName" : {
          "$first" : "$ActivityName"
        },
        "participant" : {
          "$first" : "$participant"
        },
        "status" : {
          "$first" : "$status"
        },
        "formValues" : {
          "$first" : "$formValues"
        },
        "district" : {
          "$first" : "$district"
        },
        "participantId" : {
          "$first" : "$participantId"
        }
      }
    },
  ]
);