import getConfigurationValueByKey from "../modules/dot-env-configuration/getConfigurationValueByKey";

export default {
  "client_id": getConfigurationValueByKey("MULESOFT_API_CLIENT_ID"),
  "client_secret": getConfigurationValueByKey("MULESOFT_API_CLIENT_SECRET")
};