db.mulesoft_api_responses_enrollment_summary_view.drop();
db.createView("mulesoft_api_responses_enrollment_summary_view","mulesoft_api_responses_enrollments_view",

  // Pipeline
  [
    // Stage 1
    {
      $group: {
        "_id" : "$teamSeasonName",
        "matchingDistrictTeamSeasonName" : {
          "$first" : "$districtSystemTeamName"
        },
        "matchingDistrict" : {
          "$first" : "$districtFields.district"
        },
        "teamSeasonId" : {
          "$first" : "$teamSeasonId"
        },
        "enrollmentCount" : {
          "$sum" : 1.0
        },
        "enrollments" : {
          "$push" : "$salesforceData"
        }
      }
    },

    // Stage 2
    {
      $sort: {
        "_id" : 1.0
      }
    },
  ]
);