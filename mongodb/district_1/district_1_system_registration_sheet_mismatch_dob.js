//removes the view
db.district_1_system_registration_sheet_mismatch_dob.drop();

//creates a new view
db.createView("district_1_system_registration_sheet_mismatch_dob","district_1_registration_sheet_participants_view",

    // Pipeline
    [
      // Stage 1
      {
        $lookup: {
          "from" : "district_1_system_registration_verify_participant_view",
          "localField" : "fullName",
          "foreignField" : "participant.name",
          "as" : "matchingDISTRICT_1Registration"
        }
      },

      // Stage 2
      {
        $unwind: {
          "path" : "$matchingDISTRICT_1Registration",
          "includeArrayIndex" : "matchingDISTRICT_1RegistrationIndex"
        }
      },

      // Stage 3
      {
        $match: {
          "matchingDISTRICT_1RegistrationIndex" : 0.0
        }
      },

      // Stage 4
      {
        $project: {
          "_id" : 1.0,
          "sheetValue" : "$participant.dateOfBirth",
          "district_1SystemValue" : "$matchingDISTRICT_1Registration.formValues.Date of Birth"
        }
      },

      // Stage 5
      {
        $project: {
          "_id" : 1.0,
          "sheetValue" : 1.0,
          "district_1SystemValue" : 1.0,
          "compare" : {
            "$cmp" : [
              "$sheetValue",
              "$district_1SystemValue"
            ]
          }
        }
      },

      // Stage 6
      {
        $match: {
          "compare" : {
            "$ne" : 0.0
          }
        }
      },

    ]

);
