import createCollectionObject from "./createCollectionObject";

const insertOneDocument = (collectionName,document) => {
  try {
    const collectionObj = createCollectionObject(collectionName);
    return new Promise((resolve, reject) => collectionObj.insertOne(document, (err, result) => !!err ? reject(err) : resolve(result.insertedId)));
  } catch (err) {
    console.error(`error inserting (insertOneDocument) into mongo server ${collectionName}`,err);
    return null;
  }
};

export default insertOneDocument;