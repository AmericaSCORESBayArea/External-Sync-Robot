db.salesforce_attendance_to_set_in_district_1.drop();
db.createView("salesforce_attendance_to_set_in_district_1","district_teams",

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
      $unset: [
        "_id",
        "enrollment",
        "instanceDate",
        "browserDate"
      ]
    },

    // Stage 3
    {
      $unwind: {
        "path" : "$attendance"
      }
    },

    // Stage 4
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

    // Stage 5
    {
      $unwind: {
        "path" : "$attendance.attendance_data"
      }
    },

    // Stage 6
    {
      $addFields: {
        "districtAttendanceDateSplit_1" : {
          "$split" : [
            "$attendance.attendance_data.date",
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
                1.0
              ]
            },
            "/"
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
                            "$districtAttendanceDateSplit_2",
                            1.0
                          ]
                        }
                      ]
                    },
                    {
                      "$arrayElemAt" : [
                        "$districtAttendanceDateSplit_2",
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

    // Stage 9
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

    // Stage 10
    {
      $unwind: {
        "path" : "$schedule"
      }
    },

    // Stage 11
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

    // Stage 12
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

    // Stage 13
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

    // Stage 14
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

    // Stage 15
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

    // Stage 16
    {
      $unwind: {
        "path" : "$attendance"
      }
    },

    // Stage 17
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

    // Stage 18
    {
      $match: {
        "attendanceDateMatch" : true
      }
    },

    // Stage 19
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

    // Stage 20
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

    // Stage 21
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

    // Stage 22
    {
      $unset: [
        "nameSplit"
      ]
    },

    // Stage 23
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

    // Stage 24
    {
      $lookup: {
        "from" : "district_team_season_name_mapping",
        "localField" : "_id",
        "foreignField" : "districtSystemTeamName",
        "as" : "districtTeamNameMapping"
      }
    },

    // Stage 25
    {
      $unwind: {
        "path" : "$districtTeamNameMapping",
        "includeArrayIndex" : "districtTeamNameMappingIndex"
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
        "attendanceDateMatch" : true,
        "studentNameMatch" : true
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
    }
  ]
);