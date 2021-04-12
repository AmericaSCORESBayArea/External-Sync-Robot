import getConfigurationValueByKey from "./dot-env-configuration/getConfigurationValueByKey";
const generateMulesoftAPIEndpoint_coach_sessions = (coachId,teamSeasonId) => `${getConfigurationValueByKey("MULESOFT_API_ROOT_URL")}/coach/${coachId}/teamseasons/${teamSeasonId}/sessions`;
export default generateMulesoftAPIEndpoint_coach_sessions;