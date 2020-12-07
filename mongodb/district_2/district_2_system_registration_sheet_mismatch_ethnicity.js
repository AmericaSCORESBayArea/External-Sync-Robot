//removes the view
db.district_2_system_registration_sheet_mismatch_ethnicity.drop();

//creates a new view
db.createView("district_2_system_registration_sheet_mismatch_ethnicity","district_2_registration_sheet_participants_view",

    // Pipeline
    [
      // Stage 1
      {
        $lookup: {
          "from" : "district_2_system_registration_verify_participant_view",
          "localField" : "fullName",
          "foreignField" : "participant.name",
          "as" : "matchingDISTRICT_2Registration"
        }
      },

      // Stage 2
      {
        $unwind: {
          "path" : "$matchingDISTRICT_2Registration",
          "includeArrayIndex" : "matchingDISTRICT_2RegistrationIndex"
        }
      },

      // Stage 3
      {
        $match: {
          "matchingDISTRICT_2RegistrationIndex" : 0.0
        }
      },

      // Stage 4
      {
        $lookup: {
          "from" : "district_2_registration_ethnicity_to_system_ethnicity_mapping_view",
          "localField" : "participant.ethnicity",
          "foreignField" : "_id",
          "as" : "matchingEthnicityMapping"
        }
      },

      // Stage 5
      {
        $unwind: {
          "path" : "$matchingEthnicityMapping",
          "includeArrayIndex" : "matchingEthnicityMappingIndex"
        }
      },

      // Stage 6
      {
        $match: {
          "matchingEthnicityMappingIndex" : 0.0
        }
      },

      // Stage 7
      {
        $project: {
          "_id" : 1.0,
          "sheetValue" : "$matchingEthnicityMapping.systemEthnicity",
          "district_2SystemValue" : "$matchingDISTRICT_2Registration.formValues.Race/Ethnicity"
        }
      },

      // Stage 8
      {
        $project: {
          "_id" : 1.0,
          "sheetValue" : 1.0,
          "district_2SystemValue" : 1.0,
          "compare" : {
            "$cmp" : [
              "$sheetValue",
              "$district_2SystemValue"
            ]
          }
        }
      },

      // Stage 9
      {
        $match: {
          "compare" : {
            "$ne" : 0.0
          }
        }
      },

    ]

);
