db.salesforce_attendance_to_set_in_district_2.drop();
db.createView("salesforce_attendance_to_set_in_district_2","district_teams",

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
      $addFields: {
        "matchingSchedule" : {
          "$eq" : [
            "$attendance.id",
            "$schedule.ServiceDateID"
          ]
        }
      }
    },

    // Stage 5
    {
      $match: {
        "matchingSchedule" : true
      }
    },

    // Stage 6
    {
      $addFields: {
        "districtAttendanceDateSplit_1" : {
          "$split" : [
            "$schedule.ServiceDate",
            " "
          ]
        }
      }
    },

    // Stage 7
    {
      $addFields: {
        "districtAttendanceDateSplit_2" : {
          "$split" : [
            {
              "$arrayElemAt" : [
                "$districtAttendanceDateSplit_1",
                2.0
              ]
            },
            ","
          ]
        },
        "monthNumber" : {
          "$cond" : [
            {
              "$eq" : [
                {
                  "$arrayElemAt" : [
                    "$districAttendanceDateSplit_1",
                    1.0
                  ]
                },
                "January"
              ]
            },
            "1",
            {
              "$cond" : [
                {
                  "$eq" : [
                    {
                      "$arrayElemAt" : [
                        "$districAttendanceDateSplit_1",
                        1.0
                      ]
                    },
                    "February"
                  ]
                },
                "2",
                {
                  "$cond" : [
                    {
                      "$eq" : [
                        {
                          "$arrayElemAt" : [
                            "$districAttendanceDateSplit_1",
                            1.0
                          ]
                        },
                        "March"
                      ]
                    },
                    "3",
                    {
                      "$cond" : [
                        {
                          "$eq" : [
                            {
                              "$arrayElemAt" : [
                                "$districAttendanceDateSplit_1",
                                1.0
                              ]
                            },
                            "April"
                          ]
                        },
                        "4",
                        {
                          "$cond" : [
                            {
                              "$eq" : [
                                {
                                  "$arrayElemAt" : [
                                    "$districAttendanceDateSplit_1",
                                    1.0
                                  ]
                                },
                                "May"
                              ]
                            },
                            "5",
                            {
                              "$cond" : [
                                {
                                  "$eq" : [
                                    {
                                      "$arrayElemAt" : [
                                        "$districAttendanceDateSplit_1",
                                        1.0
                                      ]
                                    },
                                    "June"
                                  ]
                                },
                                "6",
                                {
                                  "$cond" : [
                                    {
                                      "$eq" : [
                                        {
                                          "$arrayElemAt" : [
                                            "$districAttendanceDateSplit_1",
                                            1.0
                                          ]
                                        },
                                        "July"
                                      ]
                                    },
                                    "7",
                                    {
                                      "$cond" : [
                                        {
                                          "$eq" : [
                                            {
                                              "$arrayElemAt" : [
                                                "$districAttendanceDateSplit_1",
                                                1.0
                                              ]
                                            },
                                            "August"
                                          ]
                                        },
                                        "8",
                                        {
                                          "$cond" : [
                                            {
                                              "$eq" : [
                                                {
                                                  "$arrayElemAt" : [
                                                    "$districAttendanceDateSplit_1",
                                                    1.0
                                                  ]
                                                },
                                                "September"
                                              ]
                                            },
                                            "9",
                                            {
                                              "$cond" : [
                                                {
                                                  "$eq" : [
                                                    {
                                                      "$arrayElemAt" : [
                                                        "$districAttendanceDateSplit_1",
                                                        1.0
                                                      ]
                                                    },
                                                    "October"
                                                  ]
                                                },
                                                "10",
                                                {
                                                  "$cond" : [
                                                    {
                                                      "$eq" : [
                                                        {
                                                          "$arrayElemAt" : [
                                                            "$districAttendanceDateSplit_1",
                                                            1.0
                                                          ]
                                                        },
                                                        "November"
                                                      ]
                                                    },
                                                    "11",
                                                    {
                                                      "$cond" : [
                                                        {
                                                          "$eq" : [
                                                            {
                                                              "$arrayElemAt" : [
                                                                "$districAttendanceDateSplit_1",
                                                                1.0
                                                              ]
                                                            },
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

    // Stage 8
    {
      $addFields: {
        "districtAttendanceDate" : {
          "$dateFromString" : {
            "dateString" : {
              "$concat" : [
                {
                  "$arrayElemAt" : [
                    "$districAttendanceDateSplit_1",
                    3.0
                  ]
                },
                "-",
                {
                  "$cond" : [
                    {
                      "$eq" : [
                        {
                          "$strLenBytes" : "$monthNumber"
                        },
                        1.0
                      ]
                    },
                    {
                      "$concat" : [
                        "0",
                        "$monthNumber"
                      ]
                    },
                    "$monthNumber"
                  ]
                },
                "-",
                {
                  "$cond" : [
                    {
                      "$eq" : [
                        {
                          "$strLenBytes" : {
                            "$arrayElemAt" : [
                              "$districtAttendanceDateSplit_2",
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
                            "$districtAttendanceDateSplit_2",
                            0.0
                          ]
                        }
                      ]
                    },
                    {
                      "$arrayElemAt" : [
                        "$districtAttendanceDateSplit_2",
                        0.0
                      ]
                    }
                  ]
                }
              ]
            },
            "format" : "%Y-%m-%d"
          }
        },
        "nameSplit" : {
          "$split" : [
            "$attendance.name",
            ","
          ]
        }
      }
    },

    // Stage 9
    {
      $group: {
        "_id" : "$details.ActivityName",
        "activityId" : {
          "$first" : "$details.ActivityID"
        },
        "district" : {
          "$first" : "$district"
        },
        "attendanceData" : {
          "$push" : {
            "id" : "$attendance.id",
            "lastNameFirstName" : "$attendance.name",
            "firstNameLastName" : {
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
            },
            "district_value" : "$attendance.value",
            "date" : "$districtAttendanceDate",
            "nameSplit" : "$nameSplit",
          }
        }
      }
    },

    // Stage 10
    {
      $lookup: {
        "from" : "district_team_season_name_mapping",
        "localField" : "_id",
        "foreignField" : "districtSystemTeamName",
        "as" : "districtTeamNameMapping"
      }
    },

    // Stage 11
    {
      $unwind: {
        "path" : "$districtTeamNameMapping",
        "includeArrayIndex" : "districtTeamNameMappingIndex"
      }
    },

    // Stage 12
    {
      $lookup: {
        "from" : "mulesoft_api_responses_attendances_results_view",
        "localField" : "districtTeamNameMapping.teamSeasonName",
        "foreignField" : "teamSeasonName",
        "as" : "matchingSalesForceAttendanceData"
      }
    },

    // Stage 13
    {
      $unwind: {
        "path" : "$matchingSalesForceAttendanceData"
      }
    },

    // Stage 14
    {
      $unwind: {
        "path" : "$attendanceData"
      }
    },

    // Stage 15
    {
      $addFields: {
        "studentNameExactMatch" : {
          "$cond" : [
            {
              "$eq" : [
                "$attendanceData.firstNameLastName",
                "$matchingSalesForceAttendanceData.studentName"
              ]
            },
            true,
            false
          ]
        },
        "attendanceNameStartFirstEndLast" : {
          "$regexMatch" : {
            "input" : "$matchingSalesForceAttendanceData.studentName",
            "regex" : {
              "$concat" : [
                {
                  "$trim" : {
                    "input" : {
                      "$arrayElemAt" : [
                        "$attendanceData.nameSplit",
                        1.0
                      ]
                    }
                  }
                },
                "( ).+( )",
                {
                  "$trim" : {
                    "input" : {
                      "$arrayElemAt" : [
                        "$attendanceData.nameSplit",
                        0.0
                      ]
                    }
                  }
                }
              ]
            }
          }
        },
        "attendanceDateMatch" : {
          "$cond" : [
            {
              "$eq" : [
                "$attendanceData.date",
                "$matchingSalesForceAttendanceData.sessionDate"
              ]
            },
            true,
            false
          ]
        }
      }
    },

    // Stage 16
    {
      $match: {
        "$and" : [
          {
            "attendanceDateMatch" : true
          },
          {
            "$or" : [
              {
                "studentNameExactMatch" : true
              },
              {
                "attendanceNameStartFirstEndLast" : true
              }
            ]
          }
        ]
      }
    },

    // Stage 17
    {
      $group: {
        "_id" : {
          "$concat" : [
            "$district",
            "_",
            "$_id",
            "_",
            "$attendanceData.id"
          ]
        },
        "serviceDateId" : {
          "$first" : "$attendanceData.id"
        },
        "activityId" : {
          "$first" : "$activityId"
        },
        "district" : {
          "$first" : "$district"
        },
        "attendanceData" : {
          "$push" : {
            "name" : "$attendanceData.lastNameFirstName",
            "attended" : "$matchingSalesForceAttendanceData.attended",
            "date" : {
              "$dateToString" : {
                "date" : "$attendanceData.date",
                "format" : "%m/%d/%Y"
              }
            }
          }
        }
      }
    },
  ]
);