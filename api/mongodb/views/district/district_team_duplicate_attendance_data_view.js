db.district_team_duplicate_attendance_data_view.drop();
db.createView("district_team_duplicate_attendance_data_view","district_teams",

  // Pipeline
  [
    // Stage 1
    {
      $unwind: {
        "path" : "$attendance"
      }
    },

    // Stage 2
    {
      $unwind: {
        "path" : "$attendance.attendance_data",
        "preserveNullAndEmptyArrays" : true
      }
    },

    // Stage 3
    {
      $project: {
        "_id" : 1.0,
        "district" : 1.0,
        "ActivityName" : "$details.ActivityName",
        "attendanceData" : {
          "$cond" : [
            {
              "$eq" : [
                "$district",
                "district_1"
              ]
            },
            "$attendance.attendance_data",
            "$attendance"
          ]
        }
      }
    },

    // Stage 4
    {
      $project: {
        "_id" : 1.0,
        "district" : 1.0,
        "ActivityName" : 1.0,
        "attendanceData" : 1.0,
        "sessionIdentifier" : {
          "$cond" : [
            {
              "$eq" : [
                "$district",
                "district_1"
              ]
            },
            "$attendanceData.date",
            "$attendanceData.id"
          ]
        }
      }
    },

    // Stage 5
    {
      $group: {
        "_id" : {
          "$concat" : [
            "$district",
            "_",
            "$ActivityName",
            "_",
            "$sessionIdentifier",
            "_",
            "$attendanceData.name"
          ]
        },
        "count" : {
          "$sum" : 1.0
        }
      }
    },

    // Stage 6
    {
      $match: {
        "count" : {
          "$gt" : 1.0
        }
      }
    },
  ]
);