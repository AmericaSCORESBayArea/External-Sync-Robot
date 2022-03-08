db.district_participants_not_in_salesforce_view.drop();
db.createView("district_participants_not_in_salesforce_view","district_participant_activity_view",

  // Pipeline
  [
    // Stage 1
    {
      $lookup: {
        "from" : "mulesoft_api_responses_enrollments_view",
        "localField" : "participant",
        "foreignField" : "districtFields.participant",
        "as" : "matchingSalesforceEnrollment"
      }
    },

    // Stage 2
    {
      $unwind: {
        "path" : "$matchingSalesforceEnrollment",
        "includeArrayIndex" : "matchingSalesforceEnrollmentIndex",
        "preserveNullAndEmptyArrays" : true
      }
    },

    // Stage 3
    {
      $match: {
        "matchingSalesforceEnrollmentIndex" : null
      }
    },
  ]
);