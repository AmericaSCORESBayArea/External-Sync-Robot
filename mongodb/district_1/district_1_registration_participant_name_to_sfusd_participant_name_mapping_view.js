//removes the view
db.district_1_registration_participant_name_to_sfusd_participant_name_mapping_view.drop();

//creates a new view
db.createView("district_1_registration_participant_name_to_sfusd_participant_name_mapping_view","extracted_tabular_data",

    // Pipeline
    [
      // Stage 1
      {
        $match: {
          "sourceId.2" : "scoresDISTRICT_1SFUSDParticipantNameMappingData"
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
          "_id" : "$extractedData.data.registrationParticipantName",
          "sfusdName" : "$extractedData.data.sfusdParticipantName"
        }
      },
    ]
);
