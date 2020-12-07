//removes the view
db.district_2_system_team_enrollment_verify_attendance_view.drop();

//creates a new view
db.createView("district_2_system_team_enrollment_verify_attendance_view","district_2_team_details_verify",

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
      $group: {
        "_id" : "$attendance.id",
        "attendanceValues" : {
          "$push" : "$attendance"
        }
      }
    },

    // Stage 3
    {
      $lookup: {
        "from" : "district_2_system_team_enrollment_verify_schedule_view",
        "localField" : "_id",
        "foreignField" : "schedule.ServiceDateID",
        "as" : "matchingSchedule"
      }
    },

    // Stage 4
    {
      $unwind: {
        "path" : "$matchingSchedule",
        "includeArrayIndex" : "matchingScheduleIndex"
      }
    },

    // Stage 5
    {
      $match: {
        "matchingScheduleIndex" : 0.0
      }
    },

    // Stage 6
    {
      $unwind: {
        "path" : "$attendanceValues"
      }
    },

    // Stage 7
    {
      $project: {
        "_id" : 1.0,
        "attendanceValues" : 1.0,
        "matchingSchedule" : 1.0,
        "nameSplit" : {
          "$split" : [
            "$attendanceValues.name",
            ", "
          ]
        }
      }
    },

    // Stage 8
    {
      $match: {
        "nameSplit.1" : {
          "$exists" : true
        }
      }
    },

    // Stage 9
    {
      $project: {
        "_id" : 1.0,
        "attendanceValues" : 1.0,
        "matchingSchedule" : 1.0,
        "fullNameFirstNameLastName" : {
          "$toLower" : {
            "$concat" : [
              {
                "$trim" : {
                  "input" : {
                    "$arrayElemAt" : [
                      "$nameSplit",
                      1.0
                    ]
                  }
                }
              },
              " ",
              {
                "$trim" : {
                  "input" : {
                    "$arrayElemAt" : [
                      "$nameSplit",
                      0.0
                    ]
                  }
                }
              }
            ]
          }
        }
      }
    },

    // Stage 10
    {
      $group: {
        "_id" : {
          "$concat" : [
            "$matchingSchedule._id",
            ".",
            "$fullNameFirstNameLastName"
          ]
        },
        "name" : {
          "$first" : "$attendanceValues.name"
        },
        "fullNameFirstNameLastName" : {
          "$first" : "$fullNameFirstNameLastName"
        },
        "date" : {
          "$first" : "$matchingSchedule.dateFormatted"
        },
        "attendanceValue" : {
          "$first" : "$attendanceValues.value"
        },
        "serviceDateId" : {
          "$first" : "$attendanceValues.id"
        },
        "district_2TeamName" : {
          "$first" : "$matchingSchedule.teamName"
        }
      }
    },

    // Stage 11
    {
      $sort: {
        "_id" : 1.0
      }
    },
  ]
);
