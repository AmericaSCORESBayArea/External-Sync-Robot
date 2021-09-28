db.salesforce_attendance_to_set_in_district.drop();
db.createView("salesforce_attendance_to_set_in_district","district_teams    ",

  // Pipeline
  [
    // Stage 1
    {
      $unset: [
        "_id",
        "enrollment",
        "instanceDate",
        "browserDate"
      ]
    },

    // Stage 2
    {
      $unwind: {
        "path" : "$attendance"
      }
    },

    // Stage 3
    {
      $addFields: {
        "districtDateRangeSplit" : {
          "$split" : [
            {
              "$arrayElemAt" : [
                "$attendance.date_range",
                0.0
              ]
            },
            "/"
          ]
        }
      }
    },

    // Stage 4
    {
      $unwind: {
        "path" : "$attendance.attendance_data"
      }
    },

    // Stage 5
    {
      $addFields: {
        "districAttendanceDateSplit_1" : {
          "$split" : [
            "$attendance.attendance_data.date",
            " "
          ]
        }
      }
    },

    // Stage 6
    {
      $addFields: {
        "districAttendanceDateSplit_2" : {
          "$split" : [
            {
              "$arrayElemAt" : [
                "$districAttendanceDateSplit_1",
                1.0
              ]
            },
            "/"
          ]
        }
      }
    },

    // Stage 7
    {
      $addFields: {
        "districtAttendanceDate" : {
          "$dateFromString" : {
            "dateString" : {
              "$concat" : [
                {
                  "$arrayElemAt" : [
                    "$districtDateRangeSplit",
                    2.0
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
                              "$districAttendanceDateSplit_2",
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
                            "$districAttendanceDateSplit_2",
                            0.0
                          ]
                        }
                      ]
                    },
                    {
                      "$arrayElemAt" : [
                        "$districAttendanceDateSplit_2",
                        0.0
                      ]
                    }
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
                              "$districAttendanceDateSplit_2",
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
                            "$districAttendanceDateSplit_2",
                            1.0
                          ]
                        }
                      ]
                    },
                    {
                      "$arrayElemAt" : [
                        "$districAttendanceDateSplit_2",
                        1.0
                      ]
                    }
                  ]
                }
              ]
            },
            "format" : "%Y-%m-%d"
          }
        }
      }
    },

    // Stage 8
    {
      $group: {
        "_id" : {
          "$concat" : [
            "$district",
            "_",
            "$details.ActivityName"
          ]
        },
        "attendance" : {
          "$push" : {
            "name" : "$attendance.attendance_data.name",
            "date" : "$districtAttendanceDate",
            "weekStart" : {
              "$arrayElemAt" : [
                "$attendance.date_range",
                0.0
              ]
            },
            "originalDateString" : "$attendance.attendance_data.date"
          }
        },
        "schedule" : {
          "$first" : "$schedule"
        },
        "details" : {
          "$first" : "$details"
        },
        "district" : {
          "$first" : "$district"
        }
      }
    },

    // Stage 9
    {
      $unwind: {
        "path" : "$schedule"
      }
    },

    // Stage 10
    {
      $addFields: {
        "scheduleSplit_1" : {
          "$split" : [
            "$schedule.ServiceDate",
            ","
          ]
        }
      }
    },

    // Stage 11
    {
      $addFields: {
        "scheduleSplit_2" : {
          "$split" : [
            {
              "$arrayElemAt" : [
                "$scheduleSplit_1",
                1.0
              ]
            },
            " "
          ]
        }
      }
    },

    // Stage 12
    {
      $addFields: {
        "scheduleDateFormattedString" : {
          "$concat" : [
            {
              "$arrayElemAt" : [
                "$scheduleSplit_1",
                2.0
              ]
            },
            "-",
            {
              "$cond" : [
                {
                  "$eq" : [
                    {
                      "$arrayElemAt" : [
                        "$scheduleSplit_2",
                        1.0
                      ]
                    },
                    "January"
                  ]
                },
                "01",
                {
                  "$cond" : [
                    {
                      "$eq" : [
                        {
                          "$arrayElemAt" : [
                            "$scheduleSplit_2",
                            1.0
                          ]
                        },
                        "February"
                      ]
                    },
                    "02",
                    {
                      "$cond" : [
                        {
                          "$eq" : [
                            {
                              "$arrayElemAt" : [
                                "$scheduleSplit_2",
                                1.0
                              ]
                            },
                            "March"
                          ]
                        },
                        "03",
                        {
                          "$cond" : [
                            {
                              "$eq" : [
                                {
                                  "$arrayElemAt" : [
                                    "$scheduleSplit_2",
                                    1.0
                                  ]
                                },
                                "April"
                              ]
                            },
                            "04",
                            {
                              "$cond" : [
                                {
                                  "$eq" : [
                                    {
                                      "$arrayElemAt" : [
                                        "$scheduleSplit_2",
                                        1.0
                                      ]
                                    },
                                    "May"
                                  ]
                                },
                                "05",
                                {
                                  "$cond" : [
                                    {
                                      "$eq" : [
                                        {
                                          "$arrayElemAt" : [
                                            "$scheduleSplit_2",
                                            1.0
                                          ]
                                        },
                                        "June"
                                      ]
                                    },
                                    "06",
                                    {
                                      "$cond" : [
                                        {
                                          "$eq" : [
                                            {
                                              "$arrayElemAt" : [
                                                "$scheduleSplit_2",
                                                1.0
                                              ]
                                            },
                                            "July"
                                          ]
                                        },
                                        "07",
                                        {
                                          "$cond" : [
                                            {
                                              "$eq" : [
                                                {
                                                  "$arrayElemAt" : [
                                                    "$scheduleSplit_2",
                                                    1.0
                                                  ]
                                                },
                                                "August"
                                              ]
                                            },
                                            "08",
                                            {
                                              "$cond" : [
                                                {
                                                  "$eq" : [
                                                    {
                                                      "$arrayElemAt" : [
                                                        "$scheduleSplit_2",
                                                        1.0
                                                      ]
                                                    },
                                                    "September"
                                                  ]
                                                },
                                                "09",
                                                {
                                                  "$cond" : [
                                                    {
                                                      "$eq" : [
                                                        {
                                                          "$arrayElemAt" : [
                                                            "$scheduleSplit_2",
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
                                                                "$scheduleSplit_2",
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
                                                                    "$scheduleSplit_2",
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
            },
            "-",
            {
              "$cond" : [
                {
                  "$eq" : [
                    {
                      "$strLenBytes" : {
                        "$arrayElemAt" : [
                          "$scheduleSplit_2",
                          2.0
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
                        "$scheduleSplit_2",
                        2.0
                      ]
                    }
                  ]
                },
                {
                  "$arrayElemAt" : [
                    "$scheduleSplit_2",
                    2.0
                  ]
                }
              ]
            }
          ]
        }
      }
    },

    // Stage 13
    {
      $addFields: {
        "scheduleDateFormattedDate" : {
          "$dateFromString" : {
            "dateString" : {
              "$trim" : {
                "input" : "$scheduleDateFormattedString"
              }
            },
            "format" : "%Y-%m-%d"
          }
        }
      }
    },

    // Stage 14
    {
      $unset: [
        "scheduleSplit_1",
        "scheduleSplit_2",
        "scheduleDateFormattedString",
        "schedule.ServiceDate",
        "schedule.BeginTime",
        "schedule.EndTime",
        "details.ActivityCategory",
        "details.ActivityDescription",
        "details.ActivityNotes",
        "details.ActivitySite",
        "details.ActivityType"
      ]
    },

    // Stage 15
    {
      $unwind: {
        "path" : "$attendance"
      }
    },

    // Stage 16
    {
      $addFields: {
        "attendanceDateMatch" : {
          "$cond" : [
            {
              "$eq" : [
                "$scheduleDateFormattedDate",
                "$attendance.date"
              ]
            },
            true,
            false
          ]
        }
      }
    },

    // Stage 17
    {
      $match: {
        "attendanceDateMatch" : true
      }
    },

    // Stage 18
    {
      $group: {
        "_id" : {
          "$concat" : [
            "$_id",
            "_",
            "$attendance.name"
          ]
        },
        "name" : {
          "$first" : "$attendance.name"
        },
        "activityId" : {
          "$first" : "$details.ActivityID"
        },
        "activityName" : {
          "$first" : "$details.ActivityName"
        },
        "district" : {
          "$first" : "$district"
        },
        "attendance" : {
          "$push" : {
            "date" : "$attendance.date",
            "serviceDateId" : "$schedule.ServiceDateID",
            "weekStart" : "$attendance.weekStart",
            "originalDateString" : "$attendance.originalDateString"
          }
        }
      }
    },

    // Stage 19
    {
      $addFields: {
        "nameSplit" : {
          "$split" : [
            "$name",
            ","
          ]
        }
      }
    },

    // Stage 20
    {
      $addFields: {
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
        }
      }
    },

    // Stage 21
    {
      $unset: [
        "nameSplit"
      ]
    },

    // Stage 22
    {
      $group: {
        "_id" : "$activityName",
        "activityId" : {
          "$first" : "$activityId"
        },
        "district" : {
          "$first" : "$district"
        },
        "attendanceData" : {
          "$push" : {
            "name" : "$firstNameLastName",
            "nameOriginal" : "$name",
            "attendance" : "$attendance"
          }
        }
      }
    },

    // Stage 23
    {
      $lookup: {
        "from" : "district_team_season_name_mapping",
        "localField" : "_id",
        "foreignField" : "districtSystemTeamName",
        "as" : "districtTeamNameMapping"
      }
    },

    // Stage 24
    {
      $unwind: {
        "path" : "$districtTeamNameMapping",
        "includeArrayIndex" : "districtTeamNameMappingIndex"
      }
    },

    // Stage 25
    {
      $match: {
        "districtTeamNameMappingIndex" : 0.0
      }
    },

    // Stage 26
    {
      $lookup: {
        "from" : "mulesoft_api_responses_attendances_results_view",
        "localField" : "districtTeamNameMapping.teamSeasonName",
        "foreignField" : "teamSeasonName",
        "as" : "matchingSalesForceAttendanceData"
      }
    },

    // Stage 27
    {
      $unwind: {
        "path" : "$matchingSalesForceAttendanceData"
      }
    },

    // Stage 28
    {
      $unwind: {
        "path" : "$attendanceData"
      }
    },

    // Stage 29
    {
      $unwind: {
        "path" : "$attendanceData.attendance"
      }
    },

    // Stage 30
    {
      $addFields: {
        "studentNameMatch" : {
          "$cond" : [
            {
              "$eq" : [
                "$attendanceData.name",
                "$matchingSalesForceAttendanceData.studentName"
              ]
            },
            true,
            false
          ]
        },
        "attendanceDateMatch" : {
          "$cond" : [
            {
              "$eq" : [
                "$attendanceData.attendance.date",
                "$matchingSalesForceAttendanceData.sessionDate"
              ]
            },
            true,
            false
          ]
        }
      }
    },

    // Stage 31
    {
      $match: {
        "studentNameMatch" : true,
        "attendanceDateMatch" : true
      }
    },

    // Stage 32
    {
      $group: {
        "_id" : {
          "$concat" : [
            "$district",
            "_",
            "$_id",
            "_",
            "$attendanceData.attendance.weekStart"
          ]
        },
        "weekStart" : {
          "$first" : "$attendanceData.attendance.weekStart"
        },
        "activityId" : {
          "$first" : "$activityId"
        },
        "district" : {
          "$first" : "$district"
        },
        "attendanceData" : {
          "$push" : {
            "name" : "$attendanceData.nameOriginal",
            "attended" : "$matchingSalesForceAttendanceData.attended",
            "date" : {
              "$dateToString" : {
                "date" : "$attendanceData.attendance.date",
                "format" : "%m/%d/%Y"
              }
            },
            "serviceDateId" : "$attendanceData.attendance.serviceDateId",
            "originalDateString" : "$attendanceData.attendance.originalDateString"
          }
        }
      }
    },
  ]
);