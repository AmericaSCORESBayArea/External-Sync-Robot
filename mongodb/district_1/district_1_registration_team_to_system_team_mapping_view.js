//removes the view
db.district_1_registration_team_to_system_team_mapping_view.drop();

//creates a new view
db.createView("district_1_registration_team_to_system_team_mapping_view","extracted_tabular_data",

    // Pipeline
    [
      // Stage 1
      {
        $match: {
          "sourceId.2" : "scoresDISTRICT_1TeamNameMappingData"
        }
      },

      // Stage 2
      {
        $unwind: {
          "path" : "$extractedData.data"
        }
      },

      // Stage 3
      {
        $project: {
          "_id" : "$extractedData.data.registrationTeamName",
          "systemTeamName" : "$extractedData.data.district_1TeamName"
        }
      },

    ]

);
