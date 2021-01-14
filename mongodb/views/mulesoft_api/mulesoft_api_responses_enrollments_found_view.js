db.mulesoft_api_responses_enrollments_found_view.drop();
db.createView("mulesoft_api_responses_enrollments_found_view","mulesoft_api_responses",

  // Pipeline
  [
    // Stage 1
    {
      $match: {
        "requestType" : "api/enrollments?teamSeasonId=[TeamSeasonId]"
      }
    },

    // Stage 2
    {
      $unwind: {
        "path" : "$data"
      }
    },

    // Stage 3
    {
      $replaceRoot: {
        "newRoot" : "$data"
      }
    },

    // Stage 4
    {
      $project: {
        "_id" : "$EnrollmentId",
        "EnrollmentId" : 1.0,
        "EnrollmentName" : 1.0,
        "TeamSeasonId" : 1.0,
        "StudentId" : 1.0,
        "StudentName" : 1.0,
        "FirstName" : 1.0,
        "LastName" : 1.0,
        "Birthdate" : 1.0,
        "Gender" : 1.0,
        "Ethnicity" : 1.0,
        "ZipCode" : 1.0,
        "TeamSeasonId_StudentId" : {
          "$concat" : [
            "$TeamSeasonId",
            "_",
            "$StudentId"
          ]
        }
      }
    },
  ]
);