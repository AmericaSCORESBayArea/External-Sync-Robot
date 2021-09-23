db.district_participants_view.drop();
db.createView("district_participants_view","district_participants",

  // Pipeline
  [
    // Stage 1
    {
      $project: {
        "_id" : {
          "$concat" : [
            "$district",
            "_",
            "$participant.id"
          ]
        },
        "district_participant" : {
          "$concat" : [
            "$district",
            "_",
            "$participant.name"
          ]
        },
        "participant" : 1.0,
        "browserDate" : 1.0,
        "instanceDate" : 1.0,
        "district" : 1.0,
        "formValues" : {
          "$arrayToObject" : "$formValues"
        }
      }
    },
  ]

);