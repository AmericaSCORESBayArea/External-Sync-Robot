import queryDocuments from "../mongo/query";
import generateMulesoftAPIEndpoint_coach_coachIdAndDate from "../modules/generateMulesoftAPI_coach_coachIdAndDate";
import getConfigurationValueByKey from "../modules/getConfigurationValueByKey";
import runMulesoftAPIRequest_GET from "../modules/runMulesoftAPIRequest_GET";

const get_coach_data = async () => {
  const requestDate = new Date();
  const dateFilter = getConfigurationValueByKey("MULESOFT_API_DATE_FILTER");
  return await new Promise(async (resolve, reject) => {
    try {
      console.log(`Starting Compare Coach Data Command...`);
      const coachIds = await queryDocuments(`salesforce_coach_ids`, {});
      if (!!coachIds && coachIds.length > 0) {
        console.log(`Getting Data for ${coachIds.length} CoachIDs...`);
        resolve(Promise.all(coachIds.map(async (item, index) => {
          return new Promise((resolve_2, reject_2) => {
            setTimeout(async () => {
              try {
                const {coachId} = item;
                if (!!coachId) {
                  const parameters = {
                    coachId,
                    dateFilter
                  };
                  resolve_2(await runMulesoftAPIRequest_GET(generateMulesoftAPIEndpoint_coach_coachIdAndDate(coachId, dateFilter), "api/coach/[coachId]/all", requestDate, parameters));
                } else {
                  console.error(`coach id is undefined for : ${JSON.stringify(item)}`);
                }
              } catch (e) {
                reject_2(e);
              }
              resolve(false);
            }, 200 * (index + 1));
          });
        })));
      } else {
        resolve("No Coach Ids found to query against");
      }
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};

export default get_coach_data;