import getConfigurationValueByKey from "./dot-env-configuration/getConfigurationValueByKey";
const generateMulesoftAPIEndpoint_coach_coachIdAndDate = (coachId,dateFilter) => `${getConfigurationValueByKey("MULESOFT_API_ROOT_URL")}/coach/${coachId}/all?firstDate=${dateFilter}`;
export default generateMulesoftAPIEndpoint_coach_coachIdAndDate;