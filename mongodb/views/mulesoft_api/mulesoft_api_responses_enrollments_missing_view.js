db.mulesoft_api_responses_enrollments_missing_view.drop();
db.createView("mulesoft_api_responses_enrollments_missing_view","mulesoft_api_responses_enrollments_view",

  // Pipeline
  [
    // Stage 1
    {
      $lookup: {
        "from" : "mulesoft_api_responses_enrollments_found_view",
        "localField" : "TeamSeasonId_StudentId",
        "foreignField" : "TeamSeasonId_StudentId",
        "as" : "matchingFoundEnrollment"
      }
    },

    // Stage 2
    {
      $unwind: {
        "path" : "$matchingFoundEnrollment",
        "includeArrayIndex" : "matchingFoundEnrollmentIndex",
        "preserveNullAndEmptyArrays" : true
      }
    },

    // Stage 3
    {
      $match: {
        "matchingFoundEnrollmentIndex" : null
      }
    },
  ]
);