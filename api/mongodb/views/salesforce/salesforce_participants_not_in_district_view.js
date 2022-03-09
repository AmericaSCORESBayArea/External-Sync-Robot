db.salesforce_participants_not_in_district_view.drop();
db.createView("salesforce_participants_not_in_district_view","mulesoft_api_responses_enrollments_found_view",

  // Pipeline
  [
    // Stage 1
    {
      $match: {
        "district" : {
          "$ne" : null
        }
      }
    },

    // Stage 2
    {
      $addFields: {
        "firstName_lastName" : {
          "$concat" : [
            "$LastName",
            ", ",
            "$FirstName"
          ]
        },
        "Birthdate_split" : {
          "$split" : [
            "$Birthdate",
            "-"
          ]
        }
      }
    },

    // Stage 3
    {
      $lookup: {
        "from" : "district_participants_view",
        "localField" : "firstName_lastName",
        "foreignField" : "participant.name",
        "as" : "matching_district_participants"
      }
    },

    // Stage 4
    {
      $unwind: {
        "path" : "$matching_district_participants",
        "preserveNullAndEmptyArrays" : true,
        "includeArrayIndex" : "matching_district_participants_index"
      }
    },

    // Stage 5
    {
      $addFields: {
        "district_firstname_lastname" : {
          "$cond" : [
            {
              "$ifNull" : [
                "$matching_district_participants.participant.name",
                false
              ]
            },
            "$matching_district_participants.participant.name",
            ""
          ]
        },
        "district_dob" : {
          "$cond" : [
            {
              "$ifNull" : [
                "$matching_district_participants.formValues.Date of Birth",
                false
              ]
            },
            "$matching_district_participants.formValues.Date of Birth",
            ""
          ]
        }
      }
    },

    // Stage 6
    {
      $addFields: {
        "district_dob_split" : {
          "$split" : [
            "$district_dob",
            "/"
          ]
        }
      }
    },

    // Stage 7
    {
      $addFields: {
        "district_dob_formatted" : {
          "$cond" : [
            {
              "$eq" : [
                {
                  "$size" : "$district_dob_split"
                },
                3.0
              ]
            },
            {
              "$concat" : [
                {
                  "$arrayElemAt" : [
                    "$district_dob_split",
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
                              "$district_dob_split",
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
                            "$district_dob_split",
                            0.0
                          ]
                        }
                      ]
                    },
                    {
                      "$arrayElemAt" : [
                        "$district_dob_split",
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
                              "$district_dob_split",
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
                            "$district_dob_split",
                            1.0
                          ]
                        }
                      ]
                    },
                    {
                      "$arrayElemAt" : [
                        "$district_dob_split",
                        1.0
                      ]
                    }
                  ]
                }
              ]
            },
            ""
          ]
        }
      }
    },

    // Stage 8
    {
      $addFields: {
        "birthdatesMatch" : {
          "$cond" : [
            {
              "$eq" : [
                "$district_dob_formatted",
                "$Birthdate"
              ]
            },
            true,
            false
          ]
        },
        "sfBirthdateExists" : {
          "$cond" : [
            {
              "$eq" : [
                {
                  "$strLenBytes" : "$Birthdate"
                },
                0.0
              ]
            },
            false,
            true
          ]
        },
        "Birthdate_formatted" : {
          "$concat" : [
            {
              "$arrayElemAt" : [
                "$Birthdate_split",
                0.0
              ]
            },
            "-",
            {
              "$arrayElemAt" : [
                "$Birthdate_split",
                1.0
              ]
            },
            "-",
            {
              "$arrayElemAt" : [
                "$Birthdate_split",
                2.0
              ]
            }
          ]
        }
      }
    },

    // Stage 9
    {
      $match: {
        "$or" : [
          {
            "matching_district_participants_index" : null
          },
          {
            "$and" : [
              {
                "birthdatesMatch" : false
              },
              {
                "sfBirthdateExists" : true
              }
            ]
          }
        ]
      }
    },
  ]
);