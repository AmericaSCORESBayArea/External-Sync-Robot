db.mulesoft_api_responses_view.drop();
db.createView("mulesoft_api_responses_view","mulesoft_api_responses",

  // Pipeline
  [
    // Stage 1
    {
      $unionWith: {
        "coll" : "mulesoft_api_responses_simulated"
      }
    }
  ]
);