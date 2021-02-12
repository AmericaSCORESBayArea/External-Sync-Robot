import queryDocuments from "../mongo/query";
import generateMulesoftAPIEndpoint_coach_coachIdAndDate from "../modules/generateMulesoftAPI_coach_coachIdAndDate";
import getConfigurationValueByKey from "../modules/getConfigurationValueByKey";
import runMulesoftAPIRequest_GET from "../modules/runMulesoftAPIRequest_GET";

const get_coach_data = async () => {
  const requestDate = new Date();
  const dateFilters = getConfigurationValueByKey("MULESOFT_API_DATE_FILTER").split(",");
  return await new Promise(async (resolve, reject) => {
    try {
      if (!!dateFilters && dateFilters.length > 0) {
        console.log(`Starting Compare Coach Data Command...`);
        const coachIds = await queryDocuments(`salesforce_coach_ids`, {});
        if (!!coachIds && coachIds.length > 0) {
          let coachAndDateOptions = [];
          coachIds.map((item) => {
            const {coachId} = item;
            dateFilters.map((item_2) => {
              coachAndDateOptions.push({
                coachId,
                dateFilter:item_2
              });
            });
          });
          console.log(`Getting Data for ${coachAndDateOptions.length} CoachID + Date Filter Combinations...`);
          resolve(Promise.all(coachAndDateOptions.map(async (item, index) => {
            return new Promise((resolve_2) => {
              setTimeout(async () => {
                try {
                  const {coachId,dateFilter} = item;
                  if (!!coachId) {
                    if (!!dateFilter) {
                      const parameters = {
                        coachId,
                        dateFilter
                      };
                      resolve_2(await runMulesoftAPIRequest_GET(generateMulesoftAPIEndpoint_coach_coachIdAndDate(coachId, dateFilter), "api/coach/[coachId]/all", requestDate, parameters));
                    } else {
                      console.error(`dateFilter is undefined for : ${JSON.stringify(item)}`);
                    }
                  } else {
                    console.error(`coach id is undefined for : ${JSON.stringify(item)}`);
                  }
                } catch (e) {
                  resolve_2(null);
                }
                resolve(false);
              }, 200 * (index + 1));
            });
          })));
        } else {
          console.error("No Coach Ids found to query against");
          resolve("No Coach Ids found to query against");
        }
      } else {
        console.error("No Date Filters found to query against");
        resolve("No Date Filters found to query against");
      }
      resolve(true);
    } catch (e) {
      console.error("unknown error with get_coach_data");
      reject(e);
    }
  });
};

export default get_coach_data;