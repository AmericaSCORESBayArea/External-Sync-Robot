import createCollectionObject from "./createCollectionObject";

const queryDocuments = (collectionName,query,fields,limit,skip) => {
  try {
    const collectionObj = createCollectionObject(collectionName);
    let options = {};
    if (!!fields) {
      options.projection = fields;
    }
    if (!!limit || limit === 0) {
      options.limit = limit;
    }
    if (!!skip || skip === 0) {
      options.skip = skip;
    }
    return new Promise((resolve, reject) => {
      collectionObj.find(query, options, async (err, res) => !!err ? reject(err) : resolve(await res.toArray()));
    });
  } catch (err) {
    console.error(`error querying mongo server ${collectionName}`,err);
    console.error(`....requested query`,query);
    return null;
  }
};

export default queryDocuments;