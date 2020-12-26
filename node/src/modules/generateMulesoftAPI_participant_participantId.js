import getConfigurationValueByKey from "./getConfigurationValueByKey";
const generateMulesoftAPIEndpoint_participant_participantId = (participantId) => `${getConfigurationValueByKey("MULESOFT_API_ROOT_URL")}/contacts?dcyfId=${encodeURIComponent(participantId)}`;
export default generateMulesoftAPIEndpoint_participant_participantId;