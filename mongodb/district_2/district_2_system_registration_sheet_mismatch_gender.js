//removes the view
db.district_2_system_registration_sheet_mismatch_gender.drop();

//creates a new view
db.createView("district_2_system_registration_sheet_mismatch_gender","district_2_registration_sheet_participants_view",

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
        $project: {
          "_id" : 1.0,
          "sheetValue" : "$participant.gender",
          "district_2SystemValue" : "$matchingDISTRICT_2Registration.formValues.Gender"
        }
      },

      // Stage 5
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
