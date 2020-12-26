import getConfigurationValueByKey from "./getConfigurationValueByKey";
const generateMulesoftAPI_participant_post_new = () => `${getConfigurationValueByKey("MULESOFT_API_ROOT_URL")}/contact`;
export default generateMulesoftAPI_participant_post_new;