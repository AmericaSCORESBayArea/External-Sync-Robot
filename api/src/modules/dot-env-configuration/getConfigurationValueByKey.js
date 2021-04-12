import configuration from "../../config";
const getConfigurationValueByKey = (configKey) => !!configuration && !!configuration.parsed ? configuration.parsed[configKey] : null;
export default getConfigurationValueByKey;