import queryDocuments from "../mongo/query";
import runMulesoftAPIRequest_GET from "../modules/runMulesoftAPIRequest_GET";
import generateMulesoftAPI_participant_participantFirstNameLastName from "../modules/generateMulesoftAPI_participant_participantFirstNameLastName";

const get_contact_data = async () => {
  return await new Promise(async (resolve, reject) => {
    try {
      console.log(`Starting Compare Participant Data Command...`);
      const participantIds = await queryDocuments(`district_participant_activity_view`, {});
      if (!!participantIds && participantIds.length > 0) {
        console.log(`Getting Data for ${participantIds.length} Participants...`);
        resolve(Promise.all(participantIds.map(async (item, index) => {
          const participantId = item?.participantId;
          const participantName = item?.participant;
          const participantDateOfBirth = item?.formValues["Date of Birth"];
          const district = item?.district;
          const activityName = item?.ActivityName;
          if (!!participantId && !!participantName && !!participantDateOfBirth && !!district) {
            let parameters = {
              participantDateOfBirth,
              participantName,
              participantId,
              district,
              activityName
            };
            return new Promise((resolve_2) => {
              setTimeout(async () => {
                console.log(`Running Request for ID ${index + 1} out of ${participantIds.length}`);
                let data = null;
                if (!data) {
                  await setTimeout(async () => {
                    console.log(`Participant First Name + Last Name Request - Trimmed (${participantId})`);
                    const nameSplitTrimmed = participantName.split(',').map((item) => item.trim());
                    if (nameSplitTrimmed.length === 2) {
                      const firstNameTrimmed = nameSplitTrimmed[1];
                      const lastNameTrimmed = nameSplitTrimmed[0];
                      parameters.firstNameTrimmed = firstNameTrimmed;
                      parameters.lastNameTrimmed = lastNameTrimmed;
                      try {
                        data = await runMulesoftAPIRequest_GET(generateMulesoftAPI_participant_participantFirstNameLastName(firstNameTrimmed, lastNameTrimmed), "/api/contacts?dcyfId&firstName=[FirstName]&lastName=[LastName]&trimmed=true&doubleEncoded=false", new Date(), parameters);
                      } catch (e) {
                        console.error(`error looking up by TRIMMED First Name + Last Name (id ${participantId})`);
                      }
                    } else {
                      console.error(`name split trimmed does not have exactly two indexes`);
                    }
                  }, 200 * (index + 1));
                }
                resolve_2(data);
              }, 200 * (index + 1));
            });
          } else {
            console.error(`either participantId, participant, participantDateOfBirth or district are undefined for : ${JSON.stringify(item)}`);
          }
        })));
      } else {
        resolve("No Participant Ids found to query against");
      }
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};

export default get_contact_data;