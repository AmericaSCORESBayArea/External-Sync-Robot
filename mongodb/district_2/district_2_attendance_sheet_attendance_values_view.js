//removes the view
db.district_2_attendance_sheet_attendance_values_view.drop();

//creates a new view
db.createView("district_2_attendance_sheet_attendance_values_view","district_2_attendance_sheet_teams_view",
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
        "path" : "$matchingDISTRICT_2TeamNameMappings",
        "includeArrayIndex" : "matchingDISTRICT_2TeamNameMappingsIndex"
      }
    },

    // Stage 3
    {
      $match: {
        "matchingDISTRICT_2TeamNameMappingsIndex" : 0.0
      }
    },

    // Stage 4
    {
      $project: {
        "_id" : 1.0,
        "attendance_values" : 1.0,
        "fullName" : {
          "$concat" : [
            "$attendance_values.lastName",
            ", ",
            "$attendance_values.firstName"
          ]
        },
        "district_2TeamName" : "$matchingDISTRICT_2TeamNameMappings.systemTeamName",
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
        }
      }
    },

    // Stage 5
    {
      $project: {
        "_id" : 1.0,
        "fullName" : 1.0,
        "district_2TeamName" : 1.0,
        "attendance_values" : 1.0,
        "date_of_month" : {
          "$arrayElemAt" : [
            "$dateSplit",
            1.0
          ]
        },
        "fullNameFirstNameLastName" : {
          "$toLower" : {
            "$concat" : [
              {
                "$trim" : {
                  "input" : "$attendance_values.firstName"
                }
              },
              " ",
              {
                "$trim" : {
                  "input" : "$attendance_values.lastName"
                }
              }
            ]
          }
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
        "district_2TeamName" : 1.0,
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
                  "$toLower" : "$district_2TeamName"
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
        "registrationSheetTeamName" : "$_id",
        "fullName" : 1.0,
        "fullNameFirstNameLastName" : 1.0,
        "district_2TeamName" : 1.0,
        "attended" : "$attendance_values.attended",
        "firstName" : "$attendance_values.firstName",
        "lastName" : "$attendance_values.lastName",
        "date_of_month" : 1.0,
        "month_and_year" : 1.0,
        "dateConverted" : 1.0
      }
    },

    // Stage 8
    {
      $sort: {
        "_id" : 1.0
      }
    }
  ]
);