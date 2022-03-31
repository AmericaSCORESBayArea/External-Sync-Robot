import getConfigurationValueByKey from "../modules/dot-env-configuration/getConfigurationValueByKey";

const MongoClient = require('mongodb').MongoClient;
import generateMongoDBConnectionURL from "./generateMongoDBConnectionURL";

const queryDocuments = (collectionName,query,fields,limit,skip) => {
  try {
    return new Promise(async (resolve) => {
      await MongoClient.connect(generateMongoDBConnectionURL(), {useUnifiedTopology: true}, function (err, client) {
        try {
          const db = client.db(getConfigurationValueByKey("MONGO_DATABASE"));
          const collection = db.collection(collectionName);
          let options = {
            allowDiskUse: true
          };
          if (!!fields) {
            options.projection = fields;
          }
          if (!!limit || limit === 0) {
            options.limit = limit;
          }
          if (!!skip || skip === 0) {
            options.skip = skip;
          }
          collection.find(query, options, async (err, res) => !!err ? resolve(null) : resolve(await res.toArray()));
        } catch(e) {
          console.error("unknown error in queryDocuments")
          console.error(e)
        }
      });
    });
  } catch (err) {
    console.error(`error querying mongo server ${collectionName}`, err);
    console.error(`....requested query`, query);
    return null;
  }
};

export default queryDocuments;