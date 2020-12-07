//removes the view
db.district_1_registration_gender_to_system_gender_mapping_view.drop();

//creates a new view
db.createView("district_1_registration_gender_to_system_gender_mapping_view","extracted_tabular_data",
  [
    {
      $match: {
      "sourceId.2" : "scoresDISTRICT_1GenderMappingData"
    }
    },
      {
        $unwind: {
          "path" : "$extractedData.data"
      }
    },
    {
      $project: {
        "_id" : "$extractedData.data.registrationGender",
        "systemTeamName" : "$extractedData.data.district_1Gender"
      }
    },
  ]
);
