import getConfigurationValueByKey from "./getConfigurationValueByKey";
const generateMulesoftAPIEndpoint_coach_coachIdAndDate = (coachId,dateFilter) => `${getConfigurationValueByKey("MULESOFT_API_ROOT_URL")}/coach/${coachId}/all?date=${dateFilter}`;
export default generateMulesoftAPIEndpoint_coach_coachIdAndDate;