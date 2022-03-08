db.district_team_attendance_district_combined_view.drop();
db.createView("district_team_attendance_district_combined_view","district_team_attendance_district1_view",

  // Pipeline
  [
    // Stage 1
    {
      $unionWith: {
        "coll" : "district_team_attendance_district2_view"
      }
    }
  ]
);