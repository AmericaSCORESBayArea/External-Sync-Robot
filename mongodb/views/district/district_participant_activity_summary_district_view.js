db.district_participant_activity_summary_district_view.drop();
db.createView("district_participant_activity_summary_district_view","district_participant_activity_view",

  // Pipeline
  [
    // Stage 1
    {
      $group: {
        "_id" : "$ActivityName",
        "enrollmentCount" : {
          "$sum" : 1.0
        },
        "district" : {
          "$first" : "$district"
        }
      }
    },

    // Stage 2
    {
      $sort: {
        "district" : 1.0,
        "_id" : 1.0
      }
    },

    // Stage 3
    {
      $group: {
        "_id" : "$district",
        "teams" : {
          "$push" : "$$ROOT"
        },
        "totalEnrollmentCount" : {
          "$sum" : "$enrollmentCount"
        }
      }
    },
  ]
);