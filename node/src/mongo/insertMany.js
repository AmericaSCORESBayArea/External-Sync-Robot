import createCollectionObject from "./createCollectionObject";

const insertManyDocuments = (collectionName,documents) => {
  try {
    const collectionObj = createCollectionObject(collectionName);
    return new Promise((resolve, reject) => collectionObj.insertMany(documents, (err, result) => resolve(result.insertedId)));
  } catch (err) {
    console.error(`error inserting (insertManyDocuments) into mongo server ${collectionName}`,err);
    return null;
  }
};
export default insertManyDocuments;