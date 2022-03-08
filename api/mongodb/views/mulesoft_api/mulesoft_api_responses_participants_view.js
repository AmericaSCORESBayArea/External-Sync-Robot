db.mulesoft_api_responses_participants_view.drop();
db.createView("mulesoft_api_responses_participants_view","mulesoft_api_responses_view",

  // Pipeline
  [
    // Stage 1
    {
      $match: {
        "requestType" : {
          "$regex" : "/api/contacts"
        }
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
      $project: {
        "_id" : {
          "$concat" : [
            "$parameters.district",
            "_",
            "$parameters.participantId",
            "_",
            "$data.Id"
          ]
        },
        "httpAPIRequestId" : "$_id",
        "httpAPIrequestDate" : 1.0,
        "dateOfBirth_district" : "$parameters.participantDateOfBirth",
        "lastNameFirstName_district" : "$parameters.participantName",
        "participantId_district" : "$parameters.participantId",
        "district" : "$parameters.district",
        "participantId_salesForce" : "$data.Id",
        "firstName_salesforce" : "$data.FirstName",
        "lastName_salesforce" : "$data.LastName",
        "dateOfBirth_salesForce" : "$data.DateOfBirth",
        "zip_salesForce" : "$data.Zip",
        "homeLanguage_salesForce" : "$data.HomeLanguage",
        "ethnicity_salesForce" : "$data.Ethnicity",
        "gender_salesForce" : "$data.Gender",
        "schoolAttending_salesForce" : "$data.SchoolAttending"
      }
    },
  ]
);