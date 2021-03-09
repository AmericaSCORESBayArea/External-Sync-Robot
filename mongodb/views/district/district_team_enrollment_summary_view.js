db.district_team_enrollment_summary_view.drop();
db.createView("district_team_enrollment_summary_view","district_teams",

  // Pipeline
  [
    // Stage 1
    {
      $unwind: {
        "path" : "$enrollment"
      }
    },

    // Stage 2
    {
      $group: {
        "_id" : {
          "$concat" : [
            "$district",
            "_",
            "$details.ActivityName",
            "_",
            "$enrollment.fullName"
          ]
        },
        "ActivityName" : {
          "$first" : "$details.ActivityName"
        },
        "fullName" : {
          "$first" : "$enrollment.fullName"
        },
        "districtPersonId" : {
          "$first" : "$enrollment.personId"
        },
        "district" : {
          "$first" : "$district"
        }
      }
    },

    // Stage 3
    {
      $group: {
        "_id" : {
          "$concat" : [
            "$district",
            "_",
            "$ActivityName"
          ]
        },
        "ActivityName" : {
          "$first" : "$ActivityName"
        },
        "district" : {
          "$first" : "$district"
        },
        "enrollmentCount" : {
          "$sum" : 1.0
        },
        "enrollments" : {
          "$push" : "$$ROOT"
        }
      }
    },

    // Stage 4
    {
      $sort: {
        "_id" : 1.0
      }
    }

  ]
);