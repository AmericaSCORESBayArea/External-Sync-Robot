import queryDocuments from "../mongo/query";

const list_participants_in_district_not_in_salesforce = async () => {
  return await new Promise(async (resolve, reject) => {
    try {
      console.log(`Starting List Participants in District not Salesforce Command...`);
      const missingParticipants = await queryDocuments(`district_participants_not_in_salesforce_view`, {});
      if (!!missingParticipants && missingParticipants.length > 0) {
        console.log(`Count : ${missingParticipants.length} Missing District Participants in Salesforce...`);
        missingParticipants.map((item,index) => {
          console.log(`[${index+1}] ${item.ActivityName} - ${item.participant}`);
        });
      } else {
        resolve("No Missing District Participants Not Found in Salesforce");
      }
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};

export default list_participants_in_district_not_in_salesforce;