import mongoServer from 'mongodb';

import getConfigurationValueByKey from "../modules/getConfigurationValueByKey";

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

//initializes Database Connection Reference
let mongoDBDatabaseReference = null;
let mongoDBClientReference = null;

const establishDatabaseConnection = async (callback,params) => {
  return new Promise(async (resolve, reject) => {
    const mongoClient = mongoServer.MongoClient;
    const dbUrl = generateMongoDBConnectionURL();
    try {
      mongoClient.connect(`${dbUrl}`, {useUnifiedTopology: true})
        .then((client) => {
            console.log(`Connected to MongoDB : ${mongoDBDatabase}`);

            //updates globally-exported references to the :
            //  CLIENT [for later DISCONNECTING] and the
            //  DATABASE [for later querying]
            mongoDBClientReference = client;
            mongoDBDatabaseReference = mongoDBClientReference.db(mongoDBDatabase);

            resolve(callback(params));
          }, (err) => {
            reject(`Error Connecting to MongoDB : ${mongoDBDatabase} ${JSON.stringify(err)}`);
          }
        );
    } catch (err) {
      console.error(`error (1) attempting to connect to mongo server ${dbUrl} and database ${mongoDBDatabase}`, err);
      reject(err);
    }
  });
};

export {
  establishDatabaseConnection,
  mongoDBClientReference,
  mongoDBDatabaseReference
};