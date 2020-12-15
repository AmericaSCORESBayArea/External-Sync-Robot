import createCollectionObject from "./createCollectionObject";

const aggregateDocuments = async (collectionName,pipeline,options) => {
  try {
    const collectionObj = createCollectionObject(collectionName);
    return await new Promise((resolve, reject) => {
      if (!!options) {
        collectionObj.aggregate(pipeline, options, async (err, res) => !!err ? reject(err) : resolve(await res.toArray()));
      } else {
        collectionObj.aggregate(pipeline, async (err, res) => !!err ? reject(err) : resolve(await res.toArray()));
      }
    });
  } catch(err) {
    console.error(`error with aggregateDocuments for collection ${collectionName}`, err);
    return []
  }
};

export default aggregateDocuments;