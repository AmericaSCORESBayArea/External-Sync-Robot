db.district_participant_activity_summary_district_view.drop();
db.createView("district_participant_activity_summary_district_view","district_participant_activity_view",

  // Pipeline
  [
    // Stage 1
    {
      $group: {
        "_id" : {
          "$concat" : [
            "$district"
          ]
        },
        "district" : {
          "$first" : "$district"
        },
        "count_enrollment" : {
          "$sum" : 1.0
        }
      }
    },
  ]
);
