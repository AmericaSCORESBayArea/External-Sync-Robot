db.district_team_attendance_district2_view.drop();
db.createView("district_team_attendance_district2_view","district_teams",

  // Pipeline
  [
    // Stage 1
    {
      $match: {
        "district" : "district_2"
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
        "path" : "$schedule"
      }
    },

    // Stage 4
    {
      $project: {
        "_id" : 1.0,
        "district" : 1.0,
        "details" : 1.0,
        "schedule" : 1.0,
        "attendance" : 1.0,
        "browserDate" : 1.0,
        "instanceDate" : 1.0,
        "beginTime" : "$schedule.BeginTime",
        "endTime" : "$schedule.EndTime",
        "cmp_value" : {
          "$cmp" : [
            "$schedule.ServiceDateID",
            "$attendance.id"
          ]
        }
      }
    },

    // Stage 5
    {
      $match: {
        "cmp_value" : 0.0
      }
    },

    // Stage 6
    {
      $project: {
        "_id" : 1.0,
        "ActivityName" : "$details.ActivityName",
        "ActivityID" : "$details.ActivityID",
        "ParticipantName" : "$attendance.name",
        "AttendanceValue" : "$attendance.value",
        "browserDate" : 1.0,
        "instanceDate" : 1.0,
        "district" : 1.0,
        "beginTime" : 1.0,
        "endTime" : 1.0,
        "SessionDate" : {
          "$split" : [
            "$schedule.ServiceDate",
            ","
          ]
        }
      }
    },

    // Stage 7
    {
      $project: {
        "_id" : 1.0,
        "ActivityName" : 1.0,
        "ActivityID" : 1.0,
        "ParticipantName" : 1.0,
        "AttendanceValue" : 1.0,
        "browserDate" : 1.0,
        "instanceDate" : 1.0,
        "district" : 1.0,
        "SessionDate" : 1.0,
        "beginTime" : 1.0,
        "endTime" : 1.0,
        "SessionDate_2" : {
          "$split" : [
            {
              "$trim" : {
                "input" : {
                  "$arrayElemAt" : [
                    "$SessionDate",
                    1.0
                  ]
                }
              }
            },
            " "
          ]
        }
      }
    },

    // Stage 8
    {
      $project: {
        "_id" : 1.0,
        "ActivityName" : 1.0,
        "ActivityID" : 1.0,
        "ParticipantName" : 1.0,
        "AttendanceValue" : 1.0,
        "browserDate" : 1.0,
        "instanceDate" : 1.0,
        "district" : 1.0,
        "SessionDate" : 1.0,
        "SessionDate_2" : 1.0,
        "beginTime" : 1.0,
        "endTime" : 1.0,
        "monthText" : {
          "$trim" : {
            "input" : {
              "$arrayElemAt" : [
                "$SessionDate_2",
                0.0
              ]
            }
          }
        },
        "sessionDayOfMonth" : {
          "$trim" : {
            "input" : {
              "$arrayElemAt" : [
                "$SessionDate_2",
                1.0
              ]
            }
          }
        },
        "sessionYear" : {
          "$trim" : {
            "input" : {
              "$arrayElemAt" : [
                "$SessionDate",
                2.0
              ]
            }
          }
        }
      }
    },

    // Stage 9
    {
      $project: {
        "_id" : 1.0,
        "ActivityName" : 1.0,
        "ActivityID" : 1.0,
        "ParticipantName" : 1.0,
        "AttendanceValue" : 1.0,
        "browserDate" : 1.0,
        "instanceDate" : 1.0,
        "district" : 1.0,
        "SessionDate" : 1.0,
        "SessionDate_2" : 1.0,
        "monthText" : 1.0,
        "sessionDayOfMonth" : 1.0,
        "sessionYear" : 1.0,
        "beginTime" : 1.0,
        "endTime" : 1.0,
        "sessionMonth" : {
          "$cond" : [
            {
              "$eq" : [
                "$monthText",
                "January"
              ]
            },
            "1",
            {
              "$cond" : [
                {
                  "$eq" : [
                    "$monthText",
                    "February"
                  ]
                },
                "2",
                {
                  "$cond" : [
                    {
                      "$eq" : [
                        "$monthText",
                        "March"
                      ]
                    },
                    "3",
                    {
                      "$cond" : [
                        {
                          "$eq" : [
                            "$monthText",
                            "April"
                          ]
                        },
                        "4",
                        {
                          "$cond" : [
                            {
                              "$eq" : [
                                "$monthText",
                                "May"
                              ]
                            },
                            "5",
                            {
                              "$cond" : [
                                {
                                  "$eq" : [
                                    "$monthText",
                                    "June"
                                  ]
                                },
                                "6",
                                {
                                  "$cond" : [
                                    {
                                      "$eq" : [
                                        "$monthText",
                                        "July"
                                      ]
                                    },
                                    "7",
                                    {
                                      "$cond" : [
                                        {
                                          "$eq" : [
                                            "$monthText",
                                            "August"
                                          ]
                                        },
                                        "8",
                                        {
                                          "$cond" : [
                                            {
                                              "$eq" : [
                                                "$monthText",
                                                "September"
                                              ]
                                            },
                                            "9",
                                            {
                                              "$cond" : [
                                                {
                                                  "$eq" : [
                                                    "$monthText",
                                                    "October"
                                                  ]
                                                },
                                                "10",
                                                {
                                                  "$cond" : [
                                                    {
                                                      "$eq" : [
                                                        "$monthText",
                                                        "November"
                                                      ]
                                                    },
                                                    "11",
                                                    {
                                                      "$cond" : [
                                                        {
                                                          "$eq" : [
                                                            "$monthText",
                                                            "December"
                                                          ]
                                                        },
                                                        "12",
                                                        "UNKNOWN_MONTH_TEXT"
                                                      ]
                                                    }
                                                  ]
                                                }
                                              ]
                                            }
                                          ]
                                        }
                                      ]
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    },

    // Stage 10
    {
      $project: {
        "_id" : 1.0,
        "ActivityName" : 1.0,
        "ActivityID" : 1.0,
        "ParticipantName" : 1.0,
        "AttendanceValue" : 1.0,
        "browserDate" : 1.0,
        "instanceDate" : 1.0,
        "district" : 1.0,
        "SessionDate" : 1.0,
        "SessionDate_2" : 1.0,
        "monthText" : 1.0,
        "sessionDayOfMonth" : 1.0,
        "sessionYear" : 1.0,
        "sessionMonth" : 1.0,
        "beginTime" : 1.0,
        "endTime" : 1.0,
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

    // Stage 11
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
        "ActivityName" : 1.0,
        "ActivityID" : 1.0,
        "ParticipantName" : 1.0,
        "AttendanceValue" : 1.0,
        "browserDate" : 1.0,
        "instanceDate" : 1.0,
        "district" : 1.0,
        "sessionMonth" : 1.0,
        "sessionDayOfMonth" : 1.0,
        "sessionYear" : 1.0,
        "sessionDateFormatted" : 1.0,
        "beginTime" : 1.0,
        "endTime" : 1.0,
        "ActivityNameAndParticipant" : {
          "$concat" : [
            "$ActivityName",
            "_",
            "$ParticipantName"
          ]
        }
      }
    },
  ]
);