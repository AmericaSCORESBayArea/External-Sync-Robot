db.salesforce_team_seasons_with_missing_district_teams.drop();
db.createView("salesforce_team_seasons_with_missing_district_teams","mulesoft_api_responses_view",
  [
    {
      "$match" : {
        "requestType" : "api/coach/[coachId]/all"
      }
    },
    {
      "$unwind" : {
        "path" : "$data"
      }
    },
    {
      "$group" : {
        "_id" : "$data.TeamSeasonName",
        "TeamSeasonId" : {
          "$first" : "$data.TeamSeasonId"
        },
        "CoachSoccer" : {
          "$first" : "$data.CoachSoccer"
        },
        "CoachWriting" : {
          "$first" : "$data.CoachWriting"
        }
      }
    },
    {
      "$sort" : {
        "_id" : 1.0
      }
    },
    {
      "$lookup" : {
        "from" : "district_team_season_name_mapping",
        "localField" : "_id",
        "foreignField" : "teamSeasonName",
        "as" : "matchingTeamSeasonMapping"
      }
    },
    {
      "$unwind" : {
        "path" : "$matchingTeamSeasonMapping",
        "includeArrayIndex" : "matchingTeamSeasonMappingIndex"
      }
    },
    {
      "$match" : {
        "matchingTeamSeasonMappingIndex" : 0.0
      }
    },
    {
      "$lookup" : {
        "from" : "district_teams",
        "localField" : "matchingTeamSeasonMapping.districtSystemTeamName",
        "foreignField" : "details.ActivityName",
        "as" : "matchingDistrictTeam"
      }
    },
    {
      "$unwind" : {
        "path" : "$matchingDistrictTeam",
        "includeArrayIndex" : "matchingDistrictTeamIndex",
        "preserveNullAndEmptyArrays" : true
      }
    },
    {
      "$match" : {
        "matchingDistrictTeamIndex" : null
      }
    },
    {
      "$lookup" : {
        "from" : "district_team_season_school_mapping",
        "localField" : "matchingTeamSeasonMapping.districtSystemTeamName",
        "foreignField" : "districtSystemTeamName",
        "as" : "matchingSchoolMapping"
      }
    },
    {
      "$unwind" : {
        "path" : "$matchingSchoolMapping",
        "includeArrayIndex" : "matchingSchoolMappingIndex"
      }
    },
    {
      "$match" : {
        "matchingSchoolMappingIndex" : 0.0
      }
    },
    {
      "$group" : {
        "_id" : "$matchingTeamSeasonMapping.districtSystemTeamName",
        "school" : {
          "$first" : "$matchingSchoolMapping.schoolName"
        }
      }
    }
  ]
);