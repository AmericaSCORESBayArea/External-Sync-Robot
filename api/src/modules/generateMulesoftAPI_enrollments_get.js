import getConfigurationValueByKey from "./dot-env-configuration/getConfigurationValueByKey";
const generateMulesoftAPIEndpoint_enrollments_get = (teamSeasonId) => `${getConfigurationValueByKey("MULESOFT_API_ROOT_URL")}/enrollments?teamSeasonId=${teamSeasonId}`;
export default generateMulesoftAPIEndpoint_enrollments_get;