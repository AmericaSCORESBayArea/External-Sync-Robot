db.district_team_schedule_date_formatted_view.drop();
db.createView("district_team_schedule_date_formatted_view","district_teams",

  // Pipeline
  [
    // Stage 1
    {
      $unwind: {
        "path" : "$schedule"
      }
    },

    // Stage 2
    {
      $project: {
        "_id" : 1.0,
        "ActivityName" : "$details.ActivityName",
        "district" : "$district",
        "ActivityID" : "$details.ActivityID",
        "ServiceDateID" : "$schedule.ServiceDateID",
        "SessionDateSplit_1" : {
          "$split" : [
            "$schedule.ServiceDate",
            ", "
          ]
        },
        "SessionDateOriginal" : "$schedule.ServiceDate"
      }
    },

    // Stage 3
    {
      $project: {
        "_id" : 1.0,
        "ActivityName" : 1.0,
        "district" : 1.0,
        "ActivityID" : 1.0,
        "ServiceDateID" : 1.0,
        "SessionDateSplit_1" : 1.0,
        "SessionDateSplit_2" : {
          "$split" : [
            {
              "$arrayElemAt" : [
                "$SessionDateSplit_1",
                1.0
              ]
            },
            " "
          ]
        },
        "SessionDateOriginal" : 1.0
      }
    },

    // Stage 4
    {
      $project: {
        "_id" : 1.0,
        "ActivityName" : 1.0,
        "district" : 1.0,
        "ActivityID" : 1.0,
        "ServiceDateID" : 1.0,
        "SessionDateSplit_1" : 1.0,
        "SessionDateSplit_2" : 1.0,
        "SessionDateOriginal" : 1.0,
        "ExtractedDay" : {
          "$arrayElemAt" : [
            "$SessionDateSplit_2",
            1.0
          ]
        },
        "monthText" : {
          "$arrayElemAt" : [
            "$SessionDateSplit_2",
            0.0
          ]
        },
        "ExtractedYear" : {
          "$arrayElemAt" : [
            "$SessionDateSplit_1",
            2.0
          ]
        }
      }
    },

    // Stage 5
    {
      $project: {
        "_id" : 1.0,
        "ActivityName" : 1.0,
        "district" : 1.0,
        "ActivityID" : 1.0,
        "ServiceDateID" : 1.0,
        "SessionDateSplit_1" : 1.0,
        "SessionDateSplit_2" : 1.0,
        "SessionDateOriginal" : 1.0,
        "ExtractedDay" : 1.0,
        "monthText" : 1.0,
        "ExtractedYear" : 1.0,
        "monthNumber" : {
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

    // Stage 6
    {
      $project: {
        "_id" : 1.0,
        "ActivityName" : 1.0,
        "district" : 1.0,
        "ActivityID" : 1.0,
        "ServiceDateID" : 1.0,
        "SessionDateSplit_1" : 1.0,
        "SessionDateSplit_2" : 1.0,
        "SessionDateOriginal" : 1.0,
        "ExtractedDay" : 1.0,
        "monthText" : 1.0,
        "ExtractedYear" : 1.0,
        "monthNumber" : 1.0,
        "dateConverted" : {
          "$dateToString" : {
            "date" : {
              "$dateFromString" : {
                "dateString" : {
                  "$concat" : [
                    "$ExtractedYear",
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
                              "$strLenBytes" : "$ExtractedDay"
                            },
                            1.0
                          ]
                        },
                        {
                          "$concat" : [
                            "0",
                            "$ExtractedDay"
                          ]
                        },
                        "$ExtractedDay"
                      ]
                    }
                  ]
                },
                "format" : "%Y-%m-%d"
              }
            },
            "format" : "%Y-%m-%d"
          }
        }
      }
    },

    // Stage 7
    {
      "$group" : {
        "_id" : {
          "$concat" : [
            "$ActivityName",
            "_",
            "$dateConverted"
          ]
        },
        "ServiceDateID" : {
          "$first" : "$ServiceDateID"
        },
        "ActivityName" : {
          "$first" : "$ActivityName"
        },
        "district" : {
          "$first" : "$district"
        },
        "ActivityID" : {
          "$first" : "$ActivityID"
        },
        "SessionDateOriginal" : {
          "$first" : "$SessionDateOriginal"
        },
        "dateConverted" : {
          "$first" : "$dateConverted"
        },
        "sessionYear" : {
          "$first" : "$ExtractedYear"
        },
        "sessionMonth" : {
          "$first" : "$monthNumber"
        },
        "sessionDay" : {
          "$first" : "$ExtractedDay"
        }
      }
    },
  ]
)