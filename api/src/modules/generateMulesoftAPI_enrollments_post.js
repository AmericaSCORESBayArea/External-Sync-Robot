import getConfigurationValueByKey from "./dot-env-configuration/getConfigurationValueByKey";
const generateMulesoftAPIEndpoint_enrollments_post = () => `${getConfigurationValueByKey("MULESOFT_API_ROOT_URL")}/enrollments`;
export default generateMulesoftAPIEndpoint_enrollments_post;