//removes the view
db.district_1_attendance_sheet_teams_view.drop();

//creates a new view
db.createView("district_1_attendance_sheet_teams_view","extracted_tabular_data",

  // Pipeline
  [
    // Stage 1
    {
      $match: {
        "sourceId.2" : "scoresDISTRICT_1AttendanceData"
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
      $group: {
        "_id" : "$extractedData.data.teamName",
        "participants" : {
          "$addToSet" : {
            "fullName" : "$fullName",
            "teamName" : "$extractedData.data.teamName"
          }
        },
        "attendance_values" : {
          "$push" : {
            "fullName" : "$fullName",
            "attended" : "$extractedData.data.attended",
            "date" : "$extractedData.data.date",
            "teamName" : "$extractedData.data.teamName"
          }
        },
        "date_values" : {
          "$addToSet" : "$extractedData.data.date"
        },
        "attended_values" : {
          "$addToSet" : "$extractedData.data.attended"
        }
      }
    },

    // Stage 10
    {
      $sort: {
        "_id" : 1.0
      }
    },

    // Stage 11
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