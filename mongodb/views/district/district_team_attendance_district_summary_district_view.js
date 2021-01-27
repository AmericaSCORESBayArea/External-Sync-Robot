db.district_team_attendance_district_summary_district_view.drop();
db.createView("district_team_attendance_district_summary_district_view","district_team_attendance_district_combined_view",

  // Pipeline
  [
    // Stage 1
    {
      $group: {
        "_id" : {
          "$concat" : [
            "$district"
          ]
        },
        "district" : {
          "$first" : "$district"
        },
        "teamName" : {
          "$first" : "$ActivityName"
        },
        "sessionDate" : {
          "$first" : "$sessionDateFormatted"
        },
        "count_present" : {
          "$sum" : {
            "$cond" : [
              {
                "$eq" : [
                  "$AttendanceValue",
                  "Present"
                ]
              },
              1.0,
              0.0
            ]
          }
        },
        "count_absent" : {
          "$sum" : {
            "$cond" : [
              {
                "$eq" : [
                  "$AttendanceValue",
                  "Absent"
                ]
              },
              1.0,
              0.0
            ]
          }
        },
        "count_notSet" : {
          "$sum" : {
            "$cond" : [
              {
                "$eq" : [
                  "$AttendanceValue",
                  "Not Set"
                ]
              },
              1.0,
              0.0
            ]
          }
        }
      }
    },

    // Stage 2
    {
      $sort: {
        "_id" : 1.0
      }
    },
  ]
);
