import getConfigurationValueByKey from "./getConfigurationValueByKey";
const generateMulesoftAPIEndpoint_attendances_post = () => `${getConfigurationValueByKey("MULESOFT_API_ROOT_URL")}/attendances`;
export default generateMulesoftAPIEndpoint_attendances_post;