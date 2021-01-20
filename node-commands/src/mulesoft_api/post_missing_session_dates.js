import queryDocuments from "../mongo/query";
import runMulesoftAPIRequest_POST from "../modules/runMulesoftAPIRequest_POST";
import generateMulesoftAPIEndpoint_coach_sessions_post_new from "../modules/generateMulesoftAPI_coach_sessions_post_new";

const post_missing_session_dates = async () => {
  const requestDate = new Date();
  return await new Promise(async (resolve, reject) => {
    try {
      console.log(`Starting Post Missing Session Dates...`);
      const missingSessionDates = await queryDocuments(`salesforce_session_dates_missing_view`, {});
      if (!!missingSessionDates && missingSessionDates.length > 0) {
        console.log(`Count : ${missingSessionDates.length} Missing Session Dates in Salesforce...`);
        resolve(Promise.all(missingSessionDates.map(async (item, index) => {
          return new Promise((resolve_2,reject_2) => {
            setTimeout(async () => {
              const {lookupSessionId,dateConverted,TeamSeasonId} = item;
              if (!!lookupSessionId && !!dateConverted && !!TeamSeasonId) {
                console.log(`Running Post for ${index + 1} - ${lookupSessionId}`);
                  const postRequestFields = {
                    SessionDate:dateConverted,
                    SessionTopic:"Writing",
                    TeamSeasonId:TeamSeasonId
                  };
                  try {
                    resolve_2(await runMulesoftAPIRequest_POST(generateMulesoftAPIEndpoint_coach_sessions_post_new(), "api/sessions", requestDate, postRequestFields));
                  } catch (e) {
                    reject_2(e);
                  }
              } else {
                console.error(`lookupSessionId,dateConverted or TeamSeasonId fields not found - ${JSON.stringify(item)}`);
              }
              resolve(false);
            }, 200 * (index + 1));
          });
        })));
      } else {
        console.error("No Missing Session Dates Found to Post");
        resolve("No Missing Session Dates Found to Post");
      }
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};

export default post_missing_session_dates;