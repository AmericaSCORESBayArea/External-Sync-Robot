//removes the view
db.district_2_system_team_enrollment_verify_schedule_view.drop();

//creates a new view
db.createView("district_2_system_team_enrollment_verify_schedule_view","district_2_team_details_verify",
// Pipeline
  [
    // Stage 1
    {
      $unwind: {
        "path" : "$schedule",
        "includeArrayIndex" : "scheduleIndex"
      }
    },

    // Stage 2
    {
      $project: {
        "_id" : 1.0,
        "details" : 1.0,
        "schedule" : 1.0,
        "scheduleIndex" : 1.0,
        "enrollment" : 1.0,
        "teamName" : "$details.ActivityName",
        "dateFormatted" : {
          "$dateToString" : {
            "date" : {
              "$toDate" : "$schedule.ServiceDate"
            },
            "format" : "%m-%d-%Y"
          }
        }
      }
    },

    // Stage 3
    {
      $project: {
        "_id" : {
          "$concat" : [
            "$details.ActivityName",
            ".",
            "$dateFormatted"
          ]
        },
        "dateFormatted" : "$dateFormatted",
        "schedule" : 1.0,
        "scheduleIndex" : 1.0,
        "enrollment" : 1.0,
        "teamName" : 1.0
      }
    },

    // Stage 4
    {
      $sort: {
        "_id" : 1.0
      }
    },

  ]

);