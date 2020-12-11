db.district_2_participants_view.drop();
db.createView("district_2_participants_view","district_2_participants",
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