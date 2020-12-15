import queryDocuments from "./query";

const getSingleDocument = async (collectionName,query,fields) => {
  const matchingDocs = !!fields ? await queryDocuments(collectionName, query, fields) : await queryDocuments(collectionName, query);
  return matchingDocs.length === 1 ? matchingDocs[0] : {}
};

export default getSingleDocument;