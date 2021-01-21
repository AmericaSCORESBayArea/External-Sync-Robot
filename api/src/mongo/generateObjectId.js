import ObjectID from "bson-objectid";

const generateObjectId = (stringInput) => {
  try {
    if (ObjectID.isValid(stringInput)) {
      return ObjectID(stringInput);
    }
  } catch (e) {
    console.error(`error in generateObjectId()`);
    console.error(e);
  }
  return null;
};

export default generateObjectId;