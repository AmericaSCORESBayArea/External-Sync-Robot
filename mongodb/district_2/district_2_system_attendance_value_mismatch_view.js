// district_2_system_attendance_value_mismatch_view

//removes the view
db.district_2_system_attendance_value_mismatch_view.drop();

//creates a new view
db.createView("district_2_system_attendance_value_mismatch_view","district_2_system_team_enrollment_verify_attendance_view",

  // Pipeline
  [
    // Stage 1
    {
      $project: {
        "_idSplit" : {
          "$split" : [
            "$_id",
            "."
          ]
        },
        "_id" : 1.0,
        "district_2TeamName" : 1.0,
        "attendanceValue" : 1.0,
        "name" : 1.0,
        "fullNameFirstNameLastName" : 1.0,
        "date" : 1.0
      }
    },

    // Stage 2
    {
      $project: {
        "_id" : {
          "$toLower" : {
            "$concat" : [
              {
                "$arrayElemAt" : [
                  "$_idSplit",
                  0.0
                ]
              },
              ".",
              {
                "$arrayElemAt" : [
                  "$_idSplit",
                  1.0
                ]
              },
              ".",
              "$name"
            ]
          }
        },
        "district_2TeamName" : 1.0,
        "attendanceValue" : 1.0,
        "name" : 1.0,
        "fullNameFirstNameLastName" : 1.0,
        "date" : 1.0
      }
    },

    // Stage 3
    {
      $lookup: {
        "from" : "district_2_attendance_sheet_attendance_values_snapshot",
        "localField" : "_id",
        "foreignField" : "_id",
        "as" : "matchingAttendance"
      }
    },

    // Stage 4
    {
      $match: {
        "matchingAttendance.0" : {
          "$exists" : true
        }
      }
    },

    // Stage 5
    {
      $unwind: {
        "path" : "$matchingAttendance",
        "includeArrayIndex" : "matchingAttendanceIndex"
      }
    },

    // Stage 6
    {
      $match: {
        "matchingAttendanceIndex" : 0.0
      }
    },

    // Stage 7
    {
      $match: {
        "$or" : [
          {
            "$and" : [
              {
                "attendanceValue" : "Present"
              },
              {
                "matchingAttendance.attended" : {
                  "$ne" : "TRUE"
                }
              }
            ]
          },
          {
            "$and" : [
              {
                "attendanceValue" : "Absent"
              },
              {
                "matchingAttendance.attended" : {
                  "$ne" : "FALSE"
                }
              }
            ]
          },
          {
            "$and" : [
              {
                "attendanceValue" : "Not set"
              },
              {
                "matchingAttendance.attended" : {
                  "$exists" : true
                }
              }
            ]
          }
        ]
      }
    },

    // Stage 8
    {
      $project: {
        "_id" : 1.0,
        "district_2TeamName" : 1.0,
        "district_2SystemAttendanceValue" : "$attendanceValue",
        "spreadsheetAttendanceValue" : "$matchingAttendance.attended",
        "name" : 1.0,
        "fullNameFirstNameLastName" : 1.0,
        "date" : 1.0
      }
    },

    // Stage 9
    {
      $sort: {
        "_id" : 1.0
      }
    }
  ]
);