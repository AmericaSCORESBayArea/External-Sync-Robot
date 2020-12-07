//removes the view
db.district_2_registration_ethnicity_to_system_ethnicity_mapping_view.drop();

//creates a new view
db.createView("district_2_registration_ethnicity_to_system_ethnicity_mapping_view","extracted_tabular_data",

    // Pipeline
    [
      // Stage 1
      {
        $match: {
          "sourceId.2" : "scoresDISTRICT_2EthnicityMappingData"
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
          "_id" : "$extractedData.data.registrationEthnicity",
          "systemEthnicity" : "$extractedData.data.district_2Ethnicity"
        }
      },

    ]

);
