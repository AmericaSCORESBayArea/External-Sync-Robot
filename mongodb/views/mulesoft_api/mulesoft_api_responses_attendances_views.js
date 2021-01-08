db.mulesoft_api_responses_attendances_views.drop();
db.createView("mulesoft_api_responses_attendances_views","mulesoft_api_responses",

  // Pipeline
  [
    // Stage 1
    {
      $project: {
        "requestDate" : 1.0,
        "_id" : 1.0,
        "districtFields" : 1.0,
        "salesforceData" : 1.0,
        "studentId" : 1.0,
        "teamSeasonId" : 1.0,
        "districtSystemTeamName" : 1.0,
        "teamSeasonName" : 1.0,
        "ActivityNameAndParticipant" : {
          "$concat" : [
            "$districtFields.ActivityName",
            "_",
            "$districtFields.participant"
          ]
        }
      }
    },

    // Stage 2
    {
      $lookup: {
        "from" : "district_team_attendance_district_combined_view",
        "localField" : "ActivityNameAndParticipant",
        "foreignField" : "ActivityNameAndParticipant",
        "as" : "matchingAttendanceValues"
      }
    },

    // Stage 3
    {
      $unwind: {
        "path" : "$matchingAttendanceValues"
      }
    },

    // Stage 4
    {
      $project: {
        "requestDate" : 1.0,
        "_id" : 1.0,
        "districtFields" : 1.0,
        "salesforceData" : 1.0,
        "studentId" : 1.0,
        "teamSeasonId" : 1.0,
        "districtSystemTeamName" : 1.0,
        "teamSeasonName" : 1.0,
        "ActivityNameAndParticipant" : 1.0,
        "matchingAttendanceValues" : 1.0,
        "TeamSeasonNameAndDate" : {
          "$concat" : [
            "$teamSeasonName",
            "_",
            "$matchingAttendanceValues.sessionDateFormatted"
          ]
        }
      }
    },

    // Stage 5
    {
      $lookup: {
        "from" : "mulesoft_api_responses_coach_sessions_view",
        "localField" : "TeamSeasonNameAndDate",
        "foreignField" : "_id",
        "as" : "matchingSFSession"
      }
    },

    // Stage 6
    {
      $unwind: {
        "path" : "$matchingSFSession",
        "includeArrayIndex" : "matchingSFSessionIndex"
      }
    },

    // Stage 7
    {
      $match: {
        "matchingSFSessionIndex" : 0.0
      }
    },

    // Stage 8
    {
      $project: {
        "districtFields" : 1.0,
        "salesforceData" : 1.0,
        "CoachSoccer" : "$matchingSFSession.CoachSoccer",
        "CoachWriting" : "$matchingSFSession.CoachWriting",
        "TeamSeasonId" : "$teamSeasonId",
        "SessionId" : "$matchingSFSession.SessionId",
        "StudentId" : "$studentId",
        "district" : "$matchingAttendanceValues.district",
        "ParticipantName" : "$matchingAttendanceValues.ParticipantName",
        "AttendanceValue" : "$matchingAttendanceValues.AttendanceValue"
      }
    },
  ]
);