import getConfigurationValueByKey from "./dot-env-configuration/getConfigurationValueByKey";
const generateMulesoftAPI_participant_post_new = () => `${getConfigurationValueByKey("MULESOFT_API_ROOT_URL")}/contacts`;
export default generateMulesoftAPI_participant_post_new;