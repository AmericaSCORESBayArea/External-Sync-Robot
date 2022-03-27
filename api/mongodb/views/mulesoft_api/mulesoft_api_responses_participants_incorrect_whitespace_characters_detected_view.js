db.mulesoft_api_responses_participants_incorrect_whitespace_characters_detected_view.drop();
db.createView("mulesoft_api_responses_participants_incorrect_whitespace_characters_detected_view","mulesoft_api_responses_participants_view",

  // Pipeline
  [
    // Stage 1
    {
      $match: {
        "$or" : [
          {
            "firstName_salesforce" : {
              "$regex" : /^( )/
            }
          },
          {
            "firstName_salesforce" : {
              "$regex" : /( )$/
            }
          },
          {
            "firstName_salesforce" : {
              "$regex" : /( )( )/
            }
          },
          {
            "lastName_salesforce" : {
              "$regex" : /^( )/
            }
          },
          {
            "lastName_salesforce" : {
              "$regex" : /( )$/
            }
          },
          {
            "lastName_salesforce" : {
              "$regex" : /( )( )/
            }
          }
        ]
      }
    }
  ]
)