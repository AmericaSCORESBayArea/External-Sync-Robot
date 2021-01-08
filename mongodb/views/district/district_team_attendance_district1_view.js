db.district_team_attendance_district1_view.drop();
db.createView("district_team_attendance_district1_view","district_teams",

  // Pipeline
  [
    // Stage 1
    {
      $match: {
        "district" : "district_1"
      }
    },

    // Stage 2
    {
      $unwind: {
        "path" : "$attendance"
      }
    },

    // Stage 3
    {
      $unwind: {
        "path" : "$attendance.attendance_data"
      }
    },

    // Stage 4
    {
      $project: {
        "ActivityType" : "$details.ActivityType",
        "ActivityName" : "$details.ActivityName",
        "ActivityCategory" : "$details.ActivityCategory",
        "ActivityDescription" : "$details.ActivityDescription",
        "ActivitySite" : "$details.ActivitySite",
        "ActivityID" : "$details.ActivityID",
        "dateWeekStart" : {
          "$split" : [
            {
              "$arrayElemAt" : [
                "$attendance.date_range",
                0.0
              ]
            },
            "/"
          ]
        },
        "dateWeekEnd" : {
          "$split" : [
            {
              "$arrayElemAt" : [
                "$attendance.date_range",
                1.0
              ]
            },
            "/"
          ]
        },
        "ParticipantName" : "$attendance.attendance_data.name",
        "SessionDate" : {
          "$split" : [
            "$attendance.attendance_data.date",
            " "
          ]
        },
        "AttendanceValue" : "$attendance.attendance_data.value",
        "browserDate" : "$browserDate",
        "instanceDate" : "$instanceDate",
        "district" : "$district"
      }
    },

    // Stage 5
    {
      $project: {
        "_id" : 1.0,
        "ActivityType" : 1.0,
        "ActivityName" : 1.0,
        "ActivityCategory" : 1.0,
        "ActivityDescription" : 1.0,
        "ActivitySite" : 1.0,
        "ActivityID" : 1.0,
        "dateWeekStart" : 1.0,
        "dateWeekEnd" : 1.0,
        "ParticipantName" : 1.0,
        "SessionDate" : 1.0,
        "AttendanceValue" : 1.0,
        "browserDate" : 1.0,
        "instanceDate" : 1.0,
        "district" : 1.0,
        "SessionDate_2" : {
          "$split" : [
            {
              "$arrayElemAt" : [
                "$SessionDate",
                1.0
              ]
            },
            "/"
          ]
        }
      }
    },

    // Stage 6
    {
      $project: {
        "_id" : 1.0,
        "ActivityType" : 1.0,
        "ActivityName" : 1.0,
        "ActivityCategory" : 1.0,
        "ActivityDescription" : 1.0,
        "ActivitySite" : 1.0,
        "ActivityID" : 1.0,
        "dateWeekStart" : 1.0,
        "dateWeekEnd" : 1.0,
        "ParticipantName" : 1.0,
        "SessionDate" : 1.0,
        "AttendanceValue" : 1.0,
        "browserDate" : 1.0,
        "instanceDate" : 1.0,
        "district" : 1.0,
        "SessionDate_2" : 1.0,
        "sessionMonth" : {
          "$arrayElemAt" : [
            "$SessionDate_2",
            0.0
          ]
        },
        "sessionDayOfMonth" : {
          "$arrayElemAt" : [
            "$SessionDate_2",
            1.0
          ]
        },
        "sessionYear" : {
          "$arrayElemAt" : [
            "$dateWeekStart",
            2.0
          ]
        }
      }
    },

    // Stage 7
    {
      $project: {
        "_id" : 1.0,
        "ActivityType" : 1.0,
        "ActivityName" : 1.0,
        "ActivityCategory" : 1.0,
        "ActivityDescription" : 1.0,
        "ActivitySite" : 1.0,
        "ActivityID" : 1.0,
        "dateWeekStart" : 1.0,
        "dateWeekEnd" : 1.0,
        "ParticipantName" : 1.0,
        "SessionDate" : 1.0,
        "AttendanceValue" : 1.0,
        "browserDate" : 1.0,
        "instanceDate" : 1.0,
        "district" : 1.0,
        "sessionMonth" : 1.0,
        "sessionDayOfMonth" : 1.0,
        "sessionYear" : 1.0,
        "sessionDateFormatted" : {
          "$concat" : [
            "$sessionYear",
            "-",
            {
              "$cond" : [
                {
                  "$eq" : [
                    {
                      "$strLenBytes" : "$sessionMonth"
                    },
                    1.0
                  ]
                },
                {
                  "$concat" : [
                    "0",
                    "$sessionMonth"
                  ]
                },
                "$sessionMonth"
              ]
            },
            "-",
            {
              "$cond" : [
                {
                  "$eq" : [
                    {
                      "$strLenBytes" : "$sessionDayOfMonth"
                    },
                    1.0
                  ]
                },
                {
                  "$concat" : [
                    "0",
                    "$sessionDayOfMonth"
                  ]
                },
                "$sessionDayOfMonth"
              ]
            }
          ]
        }
      }
    },

    // Stage 8
    {
      $project: {
        "_id" : {
          "$concat" : [
            "$district",
            "_",
            "$ActivityID",
            "_",
            "$sessionDateFormatted",
            "_",
            "$ParticipantName"
          ]
        },
        "ActivityType" : 1.0,
        "ActivityName" : 1.0,
        "ActivityCategory" : 1.0,
        "ActivityDescription" : 1.0,
        "ActivitySite" : 1.0,
        "ActivityID" : 1.0,
        "ParticipantName" : 1.0,
        "AttendanceValue" : 1.0,
        "browserDate" : 1.0,
        "instanceDate" : 1.0,
        "district" : 1.0,
        "sessionMonth" : 1.0,
        "sessionDayOfMonth" : 1.0,
        "sessionYear" : 1.0,
        "sessionDateFormatted" : 1.0
      }
    },
  ]
);