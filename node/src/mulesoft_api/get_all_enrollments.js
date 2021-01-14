import queryDocuments from "../mongo/query";
import runMulesoftAPIRequest_GET from "../modules/runMulesoftAPIRequest_GET";
import generateMulesoftAPIEndpoint_enrollments_get from "../modules/generateMulesoftAPI_enrollments_get";

const get_all_enrollments = async () => {
  const requestDate = new Date();
  return await new Promise(async (resolve, reject) => {
    try {
      console.log(`Starting Get All Enrollments from Team Seasons...`);
      const teamSeasons = await queryDocuments(`mulesoft_api_responses_team_season_id_view`, {});
      if (!!teamSeasons && teamSeasons.length > 0) {
        console.log(`Count : ${teamSeasons.length} Team Seasons in Salesforce...`);
        resolve(Promise.all(teamSeasons.map(async (item, index) => {
          return new Promise((resolve_2,reject_2) => {
            setTimeout(async () => {
              const {TeamSeasonId} = item;
              if (!!TeamSeasonId) {
                console.log(`Running Post for ${index + 1} of ${teamSeasons.length} - ${TeamSeasonId}`);
                const postRequestFields = {
                  TeamSeasonId
                };
                try {
                  resolve_2(await runMulesoftAPIRequest_GET(generateMulesoftAPIEndpoint_enrollments_get(TeamSeasonId), "api/enrollments?teamSeasonId=[TeamSeasonId]", requestDate, postRequestFields));
                } catch (e) {
                  reject_2(e);
                }
              } else {
                console.error(`TeamSeasonId not found - ${JSON.stringify(item)}`);
              }
              resolve(false);
            }, 200 * (index + 1));
          });
        })));
      } else {
        console.error("No Team Seasons Found to Get Enrollment");
        resolve("No Team Seasons Found to Get Enrollment");
      }
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};

export default get_all_enrollments;