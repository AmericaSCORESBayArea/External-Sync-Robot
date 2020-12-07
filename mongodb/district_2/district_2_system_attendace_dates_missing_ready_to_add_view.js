//removes the view
db.district_2_system_attendace_dates_missing_ready_to_add_view.drop();

//creates a new view
db.createView("district_2_system_attendace_dates_missing_ready_to_add_view","district_2_attendance_sheet_teams_view",

  // Pipeline
  [
    // Stage 1
    {
      $unwind: {
        "path" : "$date_values"
      }
    },

    // Stage 2
    {
      $project: {
        "_id" : 1.0,
        "date_values" : 1.0,
        "monthText" : {
          "$substr" : [
            "$date_values",
            0.0,
            3.0
          ]
        },
        "dateSplit" : {
          "$split" : [
            "$date_values",
            "-"
          ]
        }
      }
    },

    // Stage 3
    {
      $project: {
        "_id" : 1.0,
        "date_of_month" : {
          "$arrayElemAt" : [
            "$dateSplit",
            1.0
          ]
        },
        "month_and_year" : {
          "$cond" : [
            {
              "$eq" : [
                "$monthText",
                "Jan"
              ]
            },
            "01-2020",
            {
              "$cond" : [
                {
                  "$eq" : [
                    "$monthText",
                    "Feb"
                  ]
                },
                "02-2020",
                {
                  "$cond" : [
                    {
                      "$eq" : [
                        "$monthText",
                        "Mar"
                      ]
                    },
                    "03-2020",
                    {
                      "$cond" : [
                        {
                          "$eq" : [
                            "$monthText",
                            "Apr"
                          ]
                        },
                        "04-2020",
                        {
                          "$cond" : [
                            {
                              "$eq" : [
                                "$monthText",
                                "May"
                              ]
                            },
                            "05-2020",
                            {
                              "$cond" : [
                                {
                                  "$eq" : [
                                    "$monthText",
                                    "Jun"
                                  ]
                                },
                                "06-2020",
                                {
                                  "$cond" : [
                                    {
                                      "$eq" : [
                                        "$monthText",
                                        "Jul"
                                      ]
                                    },
                                    "07-2020",
                                    {
                                      "$cond" : [
                                        {
                                          "$eq" : [
                                            "$monthText",
                                            "Aug"
                                          ]
                                        },
                                        "08-2019",
                                        {
                                          "$cond" : [
                                            {
                                              "$eq" : [
                                                "$monthText",
                                                "Sep"
                                              ]
                                            },
                                            "09-2019",
                                            {
                                              "$cond" : [
                                                {
                                                  "$eq" : [
                                                    "$monthText",
                                                    "Oct"
                                                  ]
                                                },
                                                "10-2019",
                                                {
                                                  "$cond" : [
                                                    {
                                                      "$eq" : [
                                                        "$monthText",
                                                        "Nov"
                                                      ]
                                                    },
                                                    "11-2019",
                                                    {
                                                      "$cond" : [
                                                        {
                                                          "$eq" : [
                                                            "$monthText",
                                                            "Dec"
                                                          ]
                                                        },
                                                        "12-2019",
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

    // Stage 4
    {
      $project: {
        "_id" : 1.0,
        "date_of_month" : 1.0,
        "month_and_year" : 1.0,
        "dateConverted" : {
          "$dateToString" : {
            "date" : {
              "$dateFromString" : {
                "dateString" : {
                  "$concat" : [
                    "$month_and_year",
                    "-",
                    "$date_of_month"
                  ]
                },
                "format" : "%m-%Y-%d"
              }
            },
            "format" : "%m-%d-%Y"
          }
        }
      }
    },

    // Stage 5
    {
      $project: {
        "_id" : {
          "$concat" : [
            "$_id",
            ".",
            "$dateConverted"
          ]
        },
        "team" : "$_id",
        "dateConverted" : "$dateConverted"
      }
    },

    // Stage 6
    {
      $lookup: {
        "from" : "district_2_registration_team_to_system_team_mapping_view",
        "localField" : "team",
        "foreignField" : "_id",
        "as" : "matchingDISTRICT_2TeamName"
      }
    },

    // Stage 7
    {
      $unwind: {
        "path" : "$matchingDISTRICT_2TeamName",
        "includeArrayIndex" : "matchingDISTRICT_2TeamNameIndex"
      }
    },

    // Stage 8
    {
      $match: {
        "matchingDISTRICT_2TeamNameIndex" : 0.0
      }
    },

    // Stage 9
    {
      $project: {
        "_id" : 1.0,
        "team" : 1.0,
        "dateConverted" : 1.0,
        "matchingDISTRICT_2TeamName" : 1.0,
        "lookupTeamAndSessionDate" : {
          "$concat" : [
            "$matchingDISTRICT_2TeamName.systemTeamName",
            ".",
            "$dateConverted"
          ]
        }
      }
    },

    // Stage 10
    {
      $lookup: {
        "from" : "district_2_system_team_enrollment_verify_schedule_view",
        "localField" : "lookupTeamAndSessionDate",
        "foreignField" : "_id",
        "as" : "matchingDISTRICT_2TeamDate"
      }
    },

    // Stage 11
    {
      $match: {
        "matchingDISTRICT_2TeamDate.0" : {
          "$exists" : false
        }
      }
    },

    // Stage 12
    {
      $lookup: {
        "from" : "district_2_team_details_verify",
        "localField" : "matchingDISTRICT_2TeamName.systemTeamName",
        "foreignField" : "details.ActivityName",
        "as" : "matchingTeamDetails"
      }
    },

    // Stage 13
    {
      $unwind: {
        "path" : "$matchingTeamDetails",
        "includeArrayIndex" : "matchingTeamDetailsIndex"
      }
    },

    // Stage 14
    {
      $match: {
        "matchingTeamDetailsIndex" : 0.0
      }
    },

    // Stage 15
    {
      $project: {
        "_id" : "$matchingTeamDetails.details.ActivityName",
        "teamName" : "$matchingTeamDetails.details.ActivityName",
        "activityId" : "$matchingTeamDetails.details.ActivityID",
        "dateFullText" : "$dateConverted"
      }
    },

    // Stage 16
    {
      $sort: {
        "teamName" : 1.0,
        "dateFullText" : 1.0
      }
    },
  ]
);