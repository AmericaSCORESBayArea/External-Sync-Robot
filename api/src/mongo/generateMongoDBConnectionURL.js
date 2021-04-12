import getConfigurationValueByKey from "../modules/dot-env-configuration/getConfigurationValueByKey";

const mongoDBUserName = getConfigurationValueByKey("MONGO_USERNAME");
const mongoDBPassword = getConfigurationValueByKey("MONGO_PASSWORD");
const mongoDBAuthDb = getConfigurationValueByKey("MONGO_AUTHDB");
const mongoDBServerIP = getConfigurationValueByKey("MONGO_IP");
const mongoDBServerPort = getConfigurationValueByKey("MONGO_PORT");
const mongoDBDatabase = getConfigurationValueByKey("MONGO_DATABASE");

const isUsernameAndPasswordDefined = () => !!mongoDBUserName && !!mongoDBPassword && mongoDBUserName.length > 0 && mongoDBPassword.length > 0;
const isAuthDatabaseDefined = () => !!mongoDBAuthDb && mongoDBAuthDb.length > 0;
const generateUsernameAndPasswordString = () => `${isUsernameAndPasswordDefined() ? `${mongoDBUserName}:${mongoDBPassword}@` : ``}`;
const generateAuthDatabaseString = () => `${isUsernameAndPasswordDefined() && isAuthDatabaseDefined() ? `?authSource=${mongoDBAuthDb}` : ``}`;
const generateMongoDBConnectionURL = () => `mongodb://${generateUsernameAndPasswordString()}${mongoDBServerIP}:${mongoDBServerPort}/${mongoDBDatabase}${isUsernameAndPasswordDefined() && isAuthDatabaseDefined() ? `${generateAuthDatabaseString()}` : ``}`;

export default generateMongoDBConnectionURL;