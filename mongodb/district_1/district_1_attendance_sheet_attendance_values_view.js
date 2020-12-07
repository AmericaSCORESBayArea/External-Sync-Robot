//removes the view
db.district_1_attendance_sheet_attendance_values_view.drop();

//creates a new view
db.createView("district_1_attendance_sheet_attendance_values_view","district_1_attendance_sheet_teams_view",

  // Pipeline
  [
    // Stage 1
    {
      $unwind: {
        "path" : "$attendance_values"
      }
    },

    // Stage 2
    {
      $unwind: {
        "path" : "$matchingDISTRICT_1TeamNameMappings",
        "includeArrayIndex" : "matchingDISTRICT_1TeamNameMappingsIndex"
      }
    },

    // Stage 3
    {
      $match: {
        "matchingDISTRICT_1TeamNameMappingsIndex" : 0.0
      }
    },

    // Stage 4
    {
      $project: {
        "_id" : 1.0,
        "attendance_values" : 1.0,
        "fullName" : "$attendance_values.fullName",
        "district_1TeamName" : "$matchingDISTRICT_1TeamNameMappings.systemTeamName",
        "monthText" : {
          "$substr" : [
            "$attendance_values.date",
            0.0,
            3.0
          ]
        },
        "dateSplit" : {
          "$split" : [
            "$attendance_values.date",
            "-"
          ]
        },
        "nameSplit" : {
          "$split" : [
            "$attendance_values.fullName",
            ", "
          ]
        }
      }
    },

    // Stage 5
    {
      $project: {
        "_id" : 1.0,
        "fullName" : 1.0,
        "fullNameFirstNameLastName" : {
          "$toLower": {
            "$concat": [
              {
                "$trim": {
                  "input": {
                    "$arrayElemAt": [
                      "$nameSplit",
                      1.0
                    ]
                  }
                }
              },
              " ",
              {
                "$trim": {
                  "input": {
                    "$arrayElemAt": [
                      "$nameSplit",
                      0.0
                    ]
                  }
                }
              }
            ]
          }
        },
        "district_1TeamName" : 1.0,
        "attendance_values" : 1.0,
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

    // Stage 6
    {
      $project: {
        "_id" : 1.0,
        "fullName" : 1.0,
        "fullNameFirstNameLastName" : 1.0,
        "district_1TeamName" : 1.0,
        "attendance_values" : 1.0,
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

    // Stage 7
    {
      $project: {
        "_id" : {
          "$concat" : [
            {
              "$trim" : {
                "input" : {
                  "$toLower" : "$district_1TeamName"
                }
              }
            },
            ".",
            {
              "$trim" : {
                "input" : {
                  "$toLower" : "$dateConverted"
                }
              }
            },
            ".",
            {
              "$trim" : {
                "input" : {
                  "$toLower" : "$fullName"
                }
              }
            }
          ]
        },
        "teamAndDate" : {
          "$concat" : [
            {
              "$trim" : {
                "input" : {
                  "$toLower" : "$district_1TeamName"
                }
              }
            },
            ".",
            {
              "$trim" : {
                "input" : {
                  "$toLower" : "$dateConverted"
                }
              }
            }
          ]
        },
        "teamAndParticipant" : {
          "$concat" : [
            {
              "$trim" : {
                "input" : {
                  "$toLower" : "$district_1TeamName"
                }
              }
            },
            ".",
            {
              "$trim" : {
                "input" : {
                  "$toLower" : "$fullName"
                }
              }
            }
          ]
        },
        "registrationSheetTeamName" : "$_id",
        "fullName" : 1.0,
        "fullNameFirstNameLastName" : 1.0,
        "district_1TeamName" : 1.0,
        "attended" : "$attendance_values.attended",
        "date_of_month" : 1.0,
        "month_and_year" : 1.0,
        "dateConverted" : 1.0
      }
    },

    // Stage 8
    {
      $match: {
        "_id" : {
          "$ne" : null
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