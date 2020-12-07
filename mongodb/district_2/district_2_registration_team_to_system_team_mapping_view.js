//removes the view
db.district_2_registration_team_to_system_team_mapping_view.drop();

//creates a new view
db.createView("district_2_registration_team_to_system_team_mapping_view","extracted_tabular_data",

    // Pipeline
    [
      // Stage 1
      {
        $match: {
          "sourceId.2" : "scoresDISTRICT_2TeamNameMappingData"
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
          "systemTeamName" : "$extractedData.data.district_2TeamName"
        }
      },

    ]

);
