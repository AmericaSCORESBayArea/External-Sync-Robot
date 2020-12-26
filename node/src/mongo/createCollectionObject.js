import {mongoDBDatabaseReference} from "./establishDatabaseConnection";

const createCollectionObject = (collectionName) => {
  let collectionObj = null;
  try {
    if (!!collectionName) {
      collectionObj = mongoDBDatabaseReference.collection(`${collectionName}`);
    }
  } catch (err) {
    console.error('error with createCollectionObject()', err);
  }
  return collectionObj;
};

export default createCollectionObject;