db.mulesoft_api_responses_attendances_results_view.drop();
db.createView("mulesoft_api_responses_attendances_results_view","mulesoft_api_responses",

  // Pipeline
  [
    // Stage 1
    {
      $match: {
        "requestType" : "api/coach/[coachId]/teamseasons/[teamSeasonId]/sessions/[sessionId]/attendances"
      }
    },

    // Stage 2
    {
      $unwind: {
        "path" : "$data"
      }
    },

    // Stage 3
    {
      $project: {
        "_id" : 1.0,
        "requestDate" : 1.0,
        "coachId" : "$parameters.coachId",
        "teamSeasonId" : "$parameters.teamSeasonId",
        "sessionId" : "$parameters.sessionId",
        "studentName" : "$data.StudentName",
        "attended" : "$data.Attended",
        "studentId" : "$data.StudentId"
      }
    },

    // Stage 4
    {
      $group: {
        "_id" : "$sessionId",
        "sessionAttendanceData" : {
          "$push" : "$$ROOT"
        }
      }
    },

    // Stage 5
    {
      $lookup: {
        "from" : "mulesoft_api_responses_session_view",
        "localField" : "_id",
        "foreignField" : "_id",
        "as" : "matchingSession"
      }
    },

    // Stage 6
    {
      $unwind: {
        "path" : "$matchingSession",
        "includeArrayIndex" : "matchingSessionIndex"
      }
    },

    // Stage 7
    {
      $match: {
        "matchingSessionIndex" : 0.0
      }
    },

    // Stage 8
    {
      $unwind: {
        "path" : "$sessionAttendanceData"
      }
    },

    // Stage 9
    {
      $project: {
        "_id" : 1.0,
        "requestDate" : "$sessionAttendanceData.requestDate",
        "coachId" : "$sessionAttendanceData.coachId",
        "teamSeasonId" : "$sessionAttendanceData.teamSeasonId",
        "sessionId" : "$sessionAttendanceData.sessionId",
        "studentName" : "$sessionAttendanceData.studentName",
        "studentId" : "$sessionAttendanceData.studentId",
        "attended" : "$sessionAttendanceData.attended",
        "sfSessionName" : "$matchingSession.sessionName",
        "sessionDate" : "$matchingSession.sessionDate",
        "sessionTopic" : "$matchingSession.sessionTopic",
        "teamSeasonName" : "$matchingSession.TeamSeasonName"
      }
    },
  ]
);