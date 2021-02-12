import queryDocuments from "../mongo/query";
import runMulesoftAPIRequest_GET from "../modules/runMulesoftAPIRequest_GET";
import generateMulesoftAPIEndpoint_attendances_get from "../modules/generateMulesoftAPI_attendances_get";

const get_all_attendances = async () => {
  const requestDate = new Date();
  return await new Promise(async (resolve, reject) => {
    try {
      console.log(`Starting GET All Attendance from Team Seasons...`);
      const teamSeasons = await queryDocuments(`mulesoft_api_responses_session_view`, {});
      const uniqueRequests = teamSeasons.map((item) => {
        const {CoachSoccer,sessionId,TeamSeasonId} = item;
        if (!!CoachSoccer && !!sessionId && !!TeamSeasonId) {
          return `${CoachSoccer}|${sessionId}|${TeamSeasonId}`;
        }
        return null;
      }).filter((item,index,arr) => !!item && arr.indexOf(item) === index);

      if (!!uniqueRequests && uniqueRequests.length > 0) {
        console.log(`Count : ${uniqueRequests.length} Team Seasons in Salesforce...`);
        resolve(Promise.all(uniqueRequests.map(async (item, index) => {
          return new Promise((resolve_2) => {
            setTimeout(async () => {
              console.log(`Running Attendance GET for ${index + 1} of ${uniqueRequests.length} - ${item}`);
              const currentItemSplit = item.split("|");
              const coachId = currentItemSplit[0];
              const teamSeasonId = currentItemSplit[2];
              const sessionId = currentItemSplit[1];
              const postRequestFields = {
                coachId,
                teamSeasonId,
                sessionId
              };
              try {
                resolve_2(await runMulesoftAPIRequest_GET(generateMulesoftAPIEndpoint_attendances_get(coachId,teamSeasonId,sessionId), "api/coach/[coachId]/teamseasons/[teamSeasonId]/sessions/[sessionId]/attendances", requestDate, postRequestFields));
              } catch (e) {
                resolve_2(null);
              }
              resolve(false);
            }, 200 * (index + 1));
          });
        })));
      } else {
        console.error("No Team Seasons Found to Get Attendance");
        resolve("No Team Seasons Found to Get Attendance");
      }
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};

export default get_all_attendances;