db.district_team_service_date_id_view.drop();
db.createView("district_team_service_date_id_view","district_teams",

  // Pipeline
  [
    // Stage 1
    {
      $unwind: {
        "path" : "$schedule"
      }
    },

    // Stage 2
    {
      $project: {
        "beginTime" : "$schedule.BeginTime",
        "endTime" : "$schedule.EndTime",
        "serviceDate" : "$schedule.ServiceDate",
        "serviceDateId" : "$schedule.ServiceDateID",
        "activityId" : "$details.ActivityID",
        "activityName" : "$details.ActivityName",
        "district" : "$district"
      }
    },
  ]
);