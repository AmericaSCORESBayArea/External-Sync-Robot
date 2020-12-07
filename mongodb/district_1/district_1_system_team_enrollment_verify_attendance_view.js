//removes the view
db.district_1_system_team_enrollment_verify_attendance_view.drop();

//creates a new view
db.createView("district_1_system_team_enrollment_verify_attendance_view","district_1_team_details_verify",

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
        "path" : "$attendance.attendance_data"
      }
    },

    // Stage 3
    {
      $project: {
        "district_1TeamName" : "$details.ActivityName",
        "dateTextSplit" : {
          "$split" : [
            "$attendance.attendance_data.date",
            " "
          ]
        },
        "attendanceValue" : "$attendance.attendance_data.value",
        "name" : "$attendance.attendance_data.name"
      }
    },

    // Stage 4
    {
      $project: {
        "district_1TeamName" : 1.0,
        "dateTextSplit" : 1.0,
        "attendanceValue" : 1.0,
        "name" : 1.0,
        "nameSplit" : {
          "$split" : [
            "$name",
            ", "
          ]
        },
        "dateNumberSplit" : {
          "$split" : [
            {
              "$arrayElemAt" : [
                "$dateTextSplit",
                1.0
              ]
            },
            "/"
          ]
        }
      }
    },

    // Stage 5
    {
      $project: {
        "district_1TeamName" : 1.0,
        "dateTextSplit" : 1.0,
        "attendanceValue" : 1.0,
        "name" : 1.0,
        "dateNumberSplit" : 1.0,
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
        },
        "dateMonth" : {
          "$toInt" : {
            "$arrayElemAt" : [
              "$dateNumberSplit",
              0.0
            ]
          }
        }
      }
    },

    // Stage 6
    {
      $project: {
        "district_1TeamName" : 1.0,
        "dateTextSplit" : 1.0,
        "attendanceValue" : 1.0,
        "name" : 1.0,
        "fullNameFirstNameLastName" : 1.0,
        "dateNumberSplit" : 1.0,
        "dateMonth" : 1.0,
        "year" : {
          "$cond" : [
            {
              "$gt" : [
                "$dateMonth",
                7.0
              ]
            },
            "2019",
            "2020"
          ]
        }
      }
    },

    // Stage 7
    {
      $project: {
        "_id" : 1.0,
        "district_1TeamName" : 1.0,
        "dateTextSplit" : 1.0,
        "attendanceValue" : 1.0,
        "name" : 1.0,
        "dateNumberSplit" : 1.0,
        "fullNameFirstNameLastName" : 1.0,
        "dateMonth" : 1.0,
        "year" : 1.0,
        "dateMonthPadded" : {
          "$cond" : [
            {
              "$eq" : [
                {
                  "$strLenCP" : {
                    "$arrayElemAt" : [
                      "$dateNumberSplit",
                      0.0
                    ]
                  }
                },
                1.0
              ]
            },
            {
              "$concat" : [
                "0",
                {
                  "$arrayElemAt" : [
                    "$dateNumberSplit",
                    0.0
                  ]
                }
              ]
            },
            {
              "$arrayElemAt" : [
                "$dateNumberSplit",
                0.0
              ]
            }
          ]
        },
        "dateDayPadded" : {
          "$cond" : [
            {
              "$eq" : [
                {
                  "$strLenCP" : {
                    "$arrayElemAt" : [
                      "$dateNumberSplit",
                      1.0
                    ]
                  }
                },
                1.0
              ]
            },
            {
              "$concat" : [
                "0",
                {
                  "$arrayElemAt" : [
                    "$dateNumberSplit",
                    1.0
                  ]
                }
              ]
            },
            {
              "$arrayElemAt" : [
                "$dateNumberSplit",
                1.0
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
            "$district_1TeamName",
            ".",
            "$dateMonthPadded",
            "-",
            "$dateDayPadded",
            "-",
            "$year",
            ".",
            "$fullNameFirstNameLastName"
          ]
        },
        "district_1TeamName" : 1.0,
        "attendanceValue" : 1.0,
        "name" : 1.0,
        "fullNameFirstNameLastName" : 1.0,
        "date" : {
          "$concat" : [
            "$dateMonthPadded",
            "-",
            "$dateDayPadded",
            "-",
            "$year"
          ]
        }
      }
    },

    // Stage 9
    {
      $sort: {
        "_id" : 1.0
      }
    },
  ]
);
