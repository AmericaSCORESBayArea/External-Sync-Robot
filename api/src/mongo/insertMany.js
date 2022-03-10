import getConfigurationValueByKey from "../modules/dot-env-configuration/getConfigurationValueByKey";
import generateMongoDBConnectionURL from "./generateMongoDBConnectionURL";
const MongoClient = require('mongodb').MongoClient;

const insertManyDocuments = (collectionName,documents) => {
  try {
    return new Promise(async (resolve) => {
      await MongoClient.connect(generateMongoDBConnectionURL(), {useUnifiedTopology: true}, function (err, client) {
        const db = client.db(getConfigurationValueByKey("MONGO_DATABASE"));
        const collection = db.collection(collectionName);
        collection.insertMany(documents, (err, result) => !!err ? resolve(null) : resolve(result.insertedId))
      });
    });
  } catch (err) {
    console.error(`error inserting (insertManyDocuments) into mongo server ${collectionName}`,err);
    return null;
  }
};

export default insertManyDocuments;