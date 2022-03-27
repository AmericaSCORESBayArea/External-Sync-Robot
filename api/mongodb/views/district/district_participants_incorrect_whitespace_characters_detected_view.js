db.district_participants_incorrect_whitespace_characters_detected_view.drop();
db.createView("district_participants_incorrect_whitespace_characters_detected_view","district_participants",

  // Pipeline
  [
    // Stage 1
    {
      $match: {
        "$or" : [
          {
            "participant.name" : {
              "$regex" : /^( )/
            }
          },
          {
            "participant.name" : {
              "$regex" : /( )$/
            }
          },
          {
            "participant.name" : {
              "$regex" : /.+( ),.+/
            }
          },
          {
            "participant.name" : {
              "$regex" : /.+,( )( )/
            }
          },
          {
            "participant.name" : {
              "$regex" : /( )( )/
            }
          }
        ]
      }
    },

    // Stage 2
    {
      $project: {
        "_id" : 1.0,
        "district" : 1.0,
        "name" : "$participant.name"
      }
    },

    // Stage 3
    {
      $sort: {
        "district" : 1.0,
        "name" : 1.0
      }
    }
  ]
);