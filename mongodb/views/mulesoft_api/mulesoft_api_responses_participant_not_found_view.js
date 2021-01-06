db.mulesoft_api_responses_participant_not_found_view.drop();
db.createView("mulesoft_api_responses_participant_not_found_view","mulesoft_api_responses_errors",

  // Pipeline
  [
    // Stage 1
    {
      $match: {
        "requestType" : "/api/contacts?dcyfId&firstName=[FirstName]&lastName=[LastName]&trimmed=true&doubleEncoded=false"
      }
    },

    // Stage 2
    {
      $sort: {
        "requestDate" : -1.0
      }
    },

    // Stage 3
    {
      $group: {
        "_id" : "$endpointURL",
        "rootDocs" : {
          "$push" : "$$ROOT"
        }
      }
    },

    // Stage 4
    {
      $unwind: {
        "path" : "$rootDocs",
        "includeArrayIndex" : "requestIndex"
      }
    },

    // Stage 5
    {
      $match: {
        "requestIndex" : 0.0
      }
    },

    // Stage 6
    {
      $replaceRoot: {
        "newRoot" : {
          "$mergeObjects" : [
            "$rootDocs",
            "$$ROOT"
          ]
        }
      }
    },

    // Stage 7
    {
      $unset: [
        "rootDocs"
      ]
    },

  ]
);