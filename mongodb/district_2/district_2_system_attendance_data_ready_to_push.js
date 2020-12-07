//removes the view
db.district_2_system_attendance_data_ready_to_push.drop();

//creates a new view
db.createView("district_2_system_attendance_data_ready_to_push","district_2_system_team_enrollment_verify_schedule_view",

  // Pipeline
  [
    // Stage 1
    {
      $unwind: {
        "path" : "$enrollment"
      }
    },

    // Stage 2
    {
      $project: {
        "_id" : 1.0,
        "schedule" : 1.0,
        "enrollment" : 1.0,
        "lookupId" : {
          "$concat" : [
            {
              "$trim" : {
                "input" : {
                  "$toLower" : "$_id"
                }
              }
            },
            ".",
            {
              "$trim" : {
                "input" : {
                  "$toLower" : "$enrollment.fullName"
                }
              }
            }
          ]
        }
      }
    },

    // Stage 3
    {
      $lookup: {
        "from" : "district_2_attendance_sheet_attendance_values_snapshot",
        "localField" : "lookupId",
        "foreignField" : "_id",
        "as" : "matchingAttendanceValue"
      }
    },

    // Stage 4
    {
      $unwind: {
        "path" : "$matchingAttendanceValue",
        "includeArrayIndex" : "matchingAttendanceValueIndex"
      }
    },

    // Stage 5
    {
      $match: {
        "matchingAttendanceValueIndex" : 0.0
      }
    },

    // Stage 6
    {
      $group: {
        "_id" : "$schedule.ServiceDateID",
        "serviceDateId" : {
          "$first" : "$schedule.ServiceDateID"
        },
        "district_2TeamName" : {
          "$first" : "$matchingAttendanceValue.district_2TeamName"
        },
        "team_and_date" : {
          "$first" : {
            "$concat" : [
              "$matchingAttendanceValue.district_2TeamName",
              ".",
              "$matchingAttendanceValue.dateConverted"
            ]
          }
        },
        "participants" : {
          "$push" : {
            "fullName" : "$matchingAttendanceValue.fullName",
            "attended" : "$matchingAttendanceValue.attended"
          }
        }
      }
    }
  ]
);