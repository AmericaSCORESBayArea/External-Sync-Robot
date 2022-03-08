// mulesoft_api_responses_attendances_duplicates_view

db.mulesoft_api_responses_attendances_duplicates_view.drop();
db.createView("mulesoft_api_responses_attendances_duplicates_view","mulesoft_api_responses_attendances_view",

  // Pipeline
  [
    // Stage 1
    {
      $group: {
        "_id" : {
          "$concat" : [
            "$matchingAttendanceValues.district",
            "_",
            "$matchingAttendanceValues.ActivityName",
            "_",
            "$sessionDateFormatted",
            "_",
            "$matchingAttendanceValues.ParticipantName"
          ]
        },
        "attendanceValues" : {
          "$push" : "$matchingAttendanceValues"
        },
        "salesforceParticipantData" : {
          "$push" : "$salesforceData"
        },
        "salesforceSessionData" : {
          "$push" : "$matchingSFSession"
        },
        "districtFields" : {
          "$push" : "$districtFields"
        },
        "count" : {
          "$sum" : 1.0
        }
      }
    },

    // Stage 2
    {
      $match: {
        "count" : {
          "$gt" : 1.0
        }
      }
    },

    // Stage 3
    {
      $sort: {
        "_id" : 1.0
      }
    },
  ]
)