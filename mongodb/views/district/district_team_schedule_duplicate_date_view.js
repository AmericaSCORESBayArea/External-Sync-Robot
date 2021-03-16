db.district_team_schedule_duplicate_date_view.drop();
db.createView("district_team_schedule_duplicate_date_view","district_team_schedule_date_formatted_view",

  // Pipeline
  [
    // Stage 1
    {
      $group: {
        "_id" : {
          "$concat" : [
            "$district",
            "_",
            "$ActivityName",
            "_",
            "$dateConverted"
          ]
        },
        "district" : {
          "$first" : "$district"
        },
        "ActivityName" : {
          "$first" : "$ActivityName"
        },
        "date" : {
          "$first" : "$dateConverted"
        },
        "count" : {
          "$sum" : 1.0
        }
      }
    },

    // Stage 2
    {
      $match: {
        "$and" : [
          {
            "count" : {
              "$gt" : 1.0
            }
          },
          {
            "_id" : {
              "$ne" : null
            }
          }
        ]
      }
    },

    // Stage 3
    {
      $sort: {
        "_id" : 1.0
      }
    },
  ]
)