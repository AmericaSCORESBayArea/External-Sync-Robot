//removes the view
db.district_2_registration_gender_to_system_gender_mapping_view.drop();

//creates a new view
db.createView("district_2_registration_gender_to_system_gender_mapping_view","extracted_tabular_data",
  [
    {
      $match: {
      "sourceId.2" : "scoresDISTRICT_2GenderMappingData"
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
        "systemTeamName" : "$extractedData.data.district_2Gender"
      }
    },
  ]
);
