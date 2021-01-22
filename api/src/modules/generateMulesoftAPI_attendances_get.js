import getConfigurationValueByKey from "./getConfigurationValueByKey";
const generateMulesoftAPIEndpoint_attendances_get = (coachId,teamSeasonId,sessionId) => `${getConfigurationValueByKey("MULESOFT_API_ROOT_URL")}/coach/${coachId}/teamseasons/${teamSeasonId}/sessions/${sessionId}/attendances`;
export default generateMulesoftAPIEndpoint_attendances_get;