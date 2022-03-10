import getConfigurationValueByKey from "../modules/dot-env-configuration/getConfigurationValueByKey";

const MongoClient = require('mongodb').MongoClient;
import generateMongoDBConnectionURL from "./generateMongoDBConnectionURL";

const insertOneDocument = (collectionName,document) => {
  try {
    return new Promise(async (resolve) => {
      await MongoClient.connect(generateMongoDBConnectionURL(), {useUnifiedTopology: true}, function (err, client) {
        const db = client.db(getConfigurationValueByKey("MONGO_DATABASE"));
        const collection = db.collection(collectionName);
        collection.insertOne(document, (err, result) => !!err ? resolve(null) : resolve(result.insertedId))
      });
    });
  } catch (err) {
    console.error(`error inserting (insertOneDocument) into mongo server ${collectionName}`,err);
    return null;
  }
};

export default insertOneDocument;