db.mulesoft_api_responses_session_duplicates_view.drop();
db.createView("mulesoft_api_responses_session_duplicates_view","mulesoft_api_responses_session_view",

  // Pipeline
  [
    // Stage 1
    {
      $project: {
        _id:1,
        sessionId:1,
        teamSeasonId:1,
        sessionName:1,
        sessionDate:1,
        sessionTopic:1,
        httpAPIRequestId:1,
        TeamSeasonName:1,
        TeamSeasonId:1,
        CoachSoccer:1,
        CoachWriting:1,
        "sessionYear" : {
          "$toString" : {
            "$year" : "$sessionDate"
          }
        },
        "sessionMonth" : {
          "$toString" : {
            "$month" : "$sessionDate"
          }
        },
        "sessionDay" : {
          "$toString" : {
            "$dayOfMonth" : "$sessionDate"
          }
        }
      }
    },

    // Stage 2
    {
      $project: {
        _id:1,
        sessionId:1,
        teamSeasonId:1,
        sessionName:1,
        sessionDate:1,
        sessionTopic:1,
        httpAPIRequestId:1,
        TeamSeasonName:1,
        TeamSeasonId:1,
        CoachSoccer:1,
        CoachWriting:1,
        sessionYear : 1,
        sessionMonth : 1,
        sessionDay : 1,
        sessionDateFormatted:{$concat:["$sessionYear","-",
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
                      "$strLenBytes" : "$sessionDay"
                    },
                    1.0
                  ]
                },
                {
                  "$concat" : [
                    "0",
                    "$sessionDay"
                  ]
                },
                "$sessionDay"
              ]
            }



          ]}
      }
    },

    // Stage 3
    {
      $sort: {
        sessionName:1
      }
    },

    // Stage 4
    {
      $group: {
        _id: {$concat:["$TeamSeasonName","_","$sessionDateFormatted"]},
        sessions:{$push:"$$ROOT"},
        count:{$sum:1}
      }
    },

    // Stage 5
    {
      $match: {
        count:{$gt:1}
      }
    },

    // Stage 6
    {
      $unwind: {
        path: "$sessions",
        includeArrayIndex:"sessionIndex"
      }
    },

    // Stage 7
    {
      $match: {
        sessionIndex:{$gt:0}
      }
    },

    // Stage 8
    {
      $replaceRoot: {
        "newRoot" : "$sessions"
      }
    },

    // Stage 9
    {
      $sort: {
        TeamSeasonName:1,
        sessionDateFormatted:1
      }
    },
  ]
);
