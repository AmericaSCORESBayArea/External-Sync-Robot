//removes the view
db.district_2_system_team_enrollment_verify_view.drop();

//creates a new view
db.createView("district_2_system_team_enrollment_verify_view","district_2_team_details_verify",

    // Pipeline
    [
      // Stage 1
      {
        $match: {
          "details.ActivityName" : {
            "$exists" : true
          }
        }
      },

      // Stage 2
      {
        $project: {
          "_id" : "$details.ActivityName",
          "enrollment" : 1.0
        }
      },

      // Stage 3
      {
        $unwind: {
          "path" : "$enrollment",
          "includeArrayIndex" : "participantIndex"
        }
      },

      // Stage 4
      {
        $sort: {
          "enrollment.fullName" : 1.0
        }
      },

      // Stage 5
      {
        $project: {
          "_id" : 1.0,
          "enrollment" : 1.0,
          "participantIndex" : 1.0,
          "nameSplit" : {
            "$split" : [
              "$enrollment.fullName",
              ", "
            ]
          }
        }
      },

      // Stage 6
      {
        $group: {
          "_id" : "$_id",
          "participants" : {
            "$push" : {
              "firstName" : {
                "$arrayElemAt" : [
                  "$nameSplit",
                  1.0
                ]
              },
              "lastName" : {
                "$arrayElemAt" : [
                  "$nameSplit",
                  0.0
                ]
              },
              "fullName" : "$enrollment.fullName",
              "personId" : "$enrollment.personId",
              "serviceId" : "$enrollment.serviceId",
              "participantIndex" : "$participantIndex"
            }
          }
        }
      },

      // Stage 7
      {
        $sort: {
          "_id" : 1.0
        }
      },

    ]

);