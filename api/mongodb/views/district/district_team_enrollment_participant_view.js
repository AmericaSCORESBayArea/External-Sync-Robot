db.district_team_enrollment_participant_view.drop();
db.createView("district_team_enrollment_participant_view","district_team_enrollment_summary_view",

  // Pipeline
  [
    // Stage 1
    {
      $unwind: {
        "path" : "$enrollments"
      }
    },

    // Stage 2
    {
      $project: {
        "_id" : {
          "$concat" : [
            "$_id",
            "_",
            "$enrollments.fullName"
          ]
        },
        "ActivityName" : 1.0,
        "district" : 1.0,
        "fullName" : "$enrollments.fullName",
        "districtPersonId" : "$enrollments.districtPersonId"
      }
    },
  ]
)
