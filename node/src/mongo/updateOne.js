import createCollectionObject from "./createCollectionObject";

const updateOneDocument = (updateQuery,collectionName,newValues,callback) => {
  try {
    const collectionObj = createCollectionObject(collectionName);
    return collectionObj.updateOne(updateQuery, newValues, (err, res) => {
      if (!!callback) {
        if (typeof callback === "function") {
          callback(err,res);
        }
      }
      if (!!res) {
        return res;
      }
    });
  } catch (err) {
    console.error(`error updating into mongo server (updateOneDocument) ${collectionName} - ${JSON.stringify(updateQuery)}`,err);
    console.error(`....requested update`,newValues);
    return null;
  }
};

export default updateOneDocument;