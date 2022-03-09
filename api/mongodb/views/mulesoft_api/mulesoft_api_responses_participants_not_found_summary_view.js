db.mulesoft_api_responses_participants_not_found_summary_view.drop();
db.createView("mulesoft_api_responses_participants_not_found_summary_view","mulesoft_api_responses_participants_not_found_view",

  // Pipeline
  [
    // Stage 1
    {
      $project: {
        "ActivityName" : 1.0,
        "participant" : 1.0,
        "participantId" : 1.0,
        "dateOfBirth" : "$formValues.Date of Birth",
        "zip" : "$formValues.Zip",
        "district" : "$district",
        "gender" : "$formValues.Gender",
        "race" : "$formValues.Race/Ethnicity"
      }
    },
  ]
)