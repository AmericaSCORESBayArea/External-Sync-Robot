//removes the view
db.district_2_system_team_enrollment_verify_participant_view.drop();

//creates a new view
db.createView("district_2_system_team_enrollment_verify_participant_view","district_2_system_team_enrollment_verify_view",

    // Pipeline
    [
      // Stage 1
      {
        $unwind: {
          "path" : "$participants",
          "includeArrayIndex" : "participantIndex"
        }
      },

      // Stage 2
      {
        $project: {
          "_id" : {
            "$concat" : [
              {
                "$trim" : {
                  "input" : {
                    "$toLower" : "$_id"
                  }
                }
              },
              ".",
              {
                "$trim" : {
                  "input" : {
                    "$toLower" : "$participants.lastName"
                  }
                }
              },
              ".",
              {
                "$trim" : {
                  "input" : {
                    "$toLower" : "$participants.firstName"
                  }
                }
              }
            ]
          },
          "participant" : "$participants",
          "participantIndex" : "$participantIndex"
        }
      },

      // Stage 3
      {
        $sort: {
          "_id" : 1.0
        }
      },

    ]

);
