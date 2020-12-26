import getConfigurationValueByKey from "../modules/getConfigurationValueByKey";

export default {
  "client_id": getConfigurationValueByKey("MULESOFT_API_CLIENT_ID"),
  "client_secret": getConfigurationValueByKey("MULESOFT_API_CLIENT_SECRET")
};