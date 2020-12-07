//removes the view
db.district_1_registration_sheet_teams_view.drop();

//creates a new view
db.createView("district_1_registration_sheet_teams_view","extracted_tabular_data",

  // Pipeline
  [
    // Stage 1
    {
      $match: {
        "sourceId.2" : "scoresDISTRICT_1EnrollmentData"
      }
    },

    // Stage 2
    {
      $unwind: {
        "path" : "$extractedData.data",
        "includeArrayIndex" : "dataIndex"
      }
    },

    // Stage 3
    {
      $sort: {
        "extractedData.data.lastName" : 1.0,
        "extractedData.data.firstName" : 1.0
      }
    },

    // Stage 4
    {
      $project: {
        "_id" : 1.0,
        "extractedData.data" : 1.0,
        "fullName" : {
          "$concat" : [
            "$extractedData.data.lastName",
            ", ",
            "$extractedData.data.firstName"
          ]
        }
      }
    },

    // Stage 5
    {
      $lookup: {
        "from" : "district_1_registration_participant_name_to_sfusd_participant_name_mapping_view",
        "localField" : "fullName",
        "foreignField" : "_id",
        "as" : "matchingSFUSDParticipantName"
      }
    },

    // Stage 6
    {
      $unwind: {
        "path" : "$matchingSFUSDParticipantName",
        "includeArrayIndex" : "matchingSFUSDParticipantNameIndex",
        "preserveNullAndEmptyArrays" : true
      }
    },

    // Stage 7
    {
      $match: {
        "$or" : [
          {
            "matchingSFUSDParticipantNameIndex" : null
          },
          {
            "matchingSFUSDParticipantNameIndex" : 0.0
          }
        ]
      }
    },

    // Stage 8
    {
      $project: {
        "_id" : 1.0,
        "extractedData.data" : 1.0,
        "fullName" : {
          "$ifNull" : [
            "$matchingSFUSDParticipantName.sfusdName",
            "$fullName"
          ]
        }
      }
    },

    // Stage 9
    {
      $addFields: {
        "extractedData.data.fullName" : "$fullName"
      }
    },

    // Stage 10
    {
      $group: {
        "_id" : "$extractedData.data.teamName",
        "participants" : {
          "$push" : "$extractedData.data"
        },
        "zip_values" : {
          "$addToSet" : "$extractedData.data.zip"
        },
        "gender_values" : {
          "$addToSet" : "$extractedData.data.gender"
        },
        "language_values" : {
          "$addToSet" : "$extractedData.data.language"
        },
        "otherLanguage_values" : {
          "$addToSet" : "$extractedData.data.otherLanguage"
        },
        "region_values" : {
          "$addToSet" : "$extractedData.data.region"
        },
        "complete_values" : {
          "$addToSet" : "$extractedData.data.complete"
        }
      }
    },

    // Stage 11
    {
      $sort: {
        "_id" : 1.0
      }
    },

    // Stage 12
    {
      $lookup: {
        "from" : "district_1_registration_team_to_system_team_mapping_view",
        "localField" : "_id",
        "foreignField" : "_id",
        "as" : "matchingDISTRICT_1TeamNameMappings"
      }
    },
  ]
);