db.mulesoft_api_responses_attendances_view.drop();
db.createView("mulesoft_api_responses_attendances_view","mulesoft_api_responses_enrollments_view",

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
        },
        "sessionDateFormatted" : "$matchingAttendanceValues.sessionDateFormatted"
      }
    },

    // Stage 5
    {
      $group: {
        "_id" : "$TeamSeasonNameAndDate",
        "attendanceItems" : {
          "$push" : "$$ROOT"
        }
      }
    },

    // Stage 6
    {
      $lookup: {
        "from" : "mulesoft_api_responses_coach_sessions_view",
        "localField" : "_id",
        "foreignField" : "_id",
        "as" : "matchingSFSession"
      }
    },

    // Stage 7
    {
      $unwind: {
        "path" : "$matchingSFSession",
        "includeArrayIndex" : "matchingSFSessionIndex"
      }
    },

    // Stage 8
    {
      $match: {
        "matchingSFSessionIndex" : 0.0
      }
    },

    // Stage 9
    {
      $unwind: {
        "path" : "$attendanceItems"
      }
    },

    // Stage 10
    {
      $project: {
        "_id" : 1.0,
        "matchingSFSession" : 1.0,
        "districtFields" : "$attendanceItems.districtFields",
        "salesforceData" : "$attendanceItems.salesforceData",
        "CoachSoccer" : "$attendanceItems.CoachSoccer",
        "CoachWriting" : "$attendanceItems.CoachWriting",
        "TeamSeasonId" : "$attendanceItems.TeamSeasonId",
        "SessionId" : "$attendanceItems.SessionId",
        "StudentId" : "$attendanceItems.StudentId",
        "district" : "$attendanceItems.district",
        "ParticipantName" : "$attendanceItems.ParticipantName",
        "AttendanceValue" : "$attendanceItems.AttendanceValue",
        "sessionDateFormatted" : "$attendanceItems.sessionDateFormatted",
        "matchingAttendanceValues" : "$attendanceItems.matchingAttendanceValues"
      }
    },
  ]
);