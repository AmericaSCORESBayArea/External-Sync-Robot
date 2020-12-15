import createCollectionObject from "./createCollectionObject";

const getDocCount = (collectionName,query,fields) => {
  try {
    const collectionObj = createCollectionObject(collectionName);
    if (!!fields) {
      return new Promise((resolve, reject) => {
        collectionObj.find(query, { projection:fields}).count((err,intCount) => {!!err ? reject(err) : resolve(intCount)});
      });
    } else {
      return new Promise((resolve, reject) => {
        collectionObj.find(query).count((err,intCount) => {!!err ? reject(err) : resolve(intCount)});
      });
    }
  } catch (err) {
    console.error(`error creating custom cursor mongo server ${collectionName}`,err);
    console.error(`....requested query`,query);
    return null;
  }
};

export default getDocCount;