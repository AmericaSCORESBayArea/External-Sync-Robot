db.district_team_session_summary_view.drop();
db.createView("district_team_session_summary_view","district_teams",

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
        "ActivityName" : "$details.ActivityName",
        "ServiceDate" : "$schedule.ServiceDate",
        "ServiceDateSplit" : {
          "$split" : [
            "$schedule.ServiceDate",
            " "
          ]
        },
        "district" : 1.0
      }
    },

    // Stage 3
    {
      $project: {
        "_id" : 1.0,
        "district" : 1.0,
        "ActivityName" : 1.0,
        "year" : {
          "$arrayElemAt" : [
            "$ServiceDateSplit",
            3.0
          ]
        }
      }
    },

    // Stage 4
    {
      $group: {
        "_id" : {
          "$concat" : [
            "$ActivityName",
            "_",
            "$year"
          ]
        },
        "ActivityName" : {
          "$first" : "$ActivityName"
        },
        "district" : {
          "$first" : "$district"
        },
        "year" : {
          "$first" : "$year"
        },
        "sessionCount" : {
          "$sum" : 1.0
        }
      }
    },

    // Stage 5
    {
      $sort: {
        "district" : 1.0,
        "_id" : 1.0
      }
    },
  ]
);