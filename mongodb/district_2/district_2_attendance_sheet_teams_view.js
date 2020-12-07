//removes the view
db.district_2_attendance_sheet_teams_view.drop();

//creates a new view
db.createView("district_2_attendance_sheet_teams_view","extracted_tabular_data",

    // Pipeline
    [
      // Stage 1
      {
        $match: {
          "sourceId.2" : "scoresDISTRICT_2AttendanceData"
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
        $group: {
          "_id" : "$extractedData.data.teamName",
          "participants" : {
            "$addToSet" : {
              "firstName" : "$extractedData.data.firstName",
              "lastName" : "$extractedData.data.lastName",
              "teamName" : "$extractedData.data.teamName"
            }
          },
          "attendance_values" : {
            "$push" : "$extractedData.data"
          },
          "date_values" : {
            "$addToSet" : "$extractedData.data.date"
          },
          "attended_values" : {
            "$addToSet" : "$extractedData.data.attended"
          }
        }
      },

      // Stage 5
      {
        $sort: {
          "_id" : 1.0
        }
      },

      // Stage 6
      {
        $lookup: {
          "from" : "district_2_registration_team_to_system_team_mapping_view",
          "localField" : "_id",
          "foreignField" : "_id",
          "as" : "matchingDISTRICT_2TeamNameMappings"
        }
      }

    ]

);




