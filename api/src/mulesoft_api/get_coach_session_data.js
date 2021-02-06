import queryDocuments from "../mongo/query";
import generateMulesoftAPIEndpoint_coach_sessions from "../modules/generateMulesoftAPI_coach_sessions";
import runMulesoftAPIRequest_GET from "../modules/runMulesoftAPIRequest_GET";

const get_coach_session_data = async () => {
  const requestDate = new Date();
  return await new Promise(async (resolve, reject) => {
    try {
      console.log(`Starting Get Compare Session Data...`);
      const teamSeasonData = await queryDocuments(`mulesoft_api_responses_team_season_id_view`, {});
      if (!!teamSeasonData && teamSeasonData.length > 0) {
        console.log(`Getting Session Data for ${teamSeasonData.length} Team Seasons...`);
        resolve(Promise.all(teamSeasonData.map(async (item, index) => {
          return new Promise((resolve_2, reject_2) => {
            setTimeout(async () => {
              try {
                const {_id, TeamSeasonId, CoachSoccer, CoachWriting} = item;
                if (!!_id && !!TeamSeasonId && !!CoachSoccer && !!CoachWriting) {
                  const parameters = {
                    teamSeason: _id,
                    TeamSeasonId,
                    CoachSoccer,
                    CoachWriting
                  };
                  if (CoachSoccer !== CoachWriting) {
                    console.error(`Different SOCCER and WRITING Coaches : ${CoachSoccer} and ${CoachWriting}`);
                  }
                  resolve_2(await runMulesoftAPIRequest_GET(generateMulesoftAPIEndpoint_coach_sessions(CoachSoccer, TeamSeasonId), "api/coach/[coachId]/teamseasons/[teamSeasonsId]/sessions", requestDate, parameters));
                } else {
                  console.error(`_id,TeamSeasonId,CoachSoccer or CoachWriting is undefined for : ${JSON.stringify(item)}`);
                }
              } catch (e) {
                reject_2(e);
              }
              resolve(false);
            }, 200 * (index + 1));
          });
        })));
      } else {
        console.error("No Team Season Data found to query against");
        resolve("No Team Season Data found to query against");
      }
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};

export default get_coach_session_data;