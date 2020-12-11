db.district_1_participants_view.drop();
db.createView("district_1_participants_view","district_1_participants",
  [
    {
      $project: {
        "_id" : 1.0,
        "participant" : 1.0,
        "browserDate" : 1.0,
        "instanceDate" : 1.0,
        "formValues" : {
          "$arrayToObject" : "$formValues"
        }
      }
    },
  ]
);