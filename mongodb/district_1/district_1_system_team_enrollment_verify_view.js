//removes the view
db.district_1_system_team_enrollment_verify_view.drop();

//creates a new view
db.createView("district_1_system_team_enrollment_verify_view","district_1_team_details_verify",

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
      $group: {
        "_id" : "$_id",
        "participants" : {
          "$push" : {
            "fullName" : "$enrollment.fullName",
            "personId" : "$enrollment.personId",
            "serviceId" : "$enrollment.serviceId",
            "participantIndex" : "$participantIndex"
          }
        }
      }
    },

    // Stage 6
    {
      $sort: {
        "_id" : 1.0
      }
    },

  ]

);