import queryDocuments from "../mongo/query";
import generateMulesoftAPI_participant_participantId from "../modules/generateMulesoftAPI_participant_participantId";
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


                // console.log(`DATA-0 : ${!!data}`);
                // if (!data) {
                //   await setTimeout(async () => {
                //   console.log(`Attempting 1 of 5 - Participant ID Only (${participantId})`);
                //   try {
                //     data = await runMulesoftAPIRequest_GET(generateMulesoftAPI_participant_participantId(participantId), "/api/contacts?dcyfId=[participantId]", new Date(), parameters);
                //   } catch (e) {
                //     console.error(`attempt 1 of 5 - error looking up by participant id only (${participantId})`);
                //   }
                //   },200);
                // }

                // console.log(`DATA-1 : ${!!data}`);
                // if (!data) {
                //   await setTimeout(async () => {
                //     console.log(`Attempting 2 of 5 - Participant First Name + Last Name - Not Trimmed (${participantId})`);
                //     const nameSplitNotTrimmed = participantName.split(',').map((item) => item);
                //     if (nameSplitNotTrimmed.length === 2) {
                //       const firstNameNotTrimmed = encodeURIComponent(nameSplitNotTrimmed[1]);
                //       const lastNameNotTrimmed = encodeURIComponent(nameSplitNotTrimmed[0]);
                //       parameters.firstNameNotTrimmed = firstNameNotTrimmed;
                //       parameters.lastNameNotTrimmed = lastNameNotTrimmed;
                //       try {
                //         data = await runMulesoftAPIRequest_GET(generateMulesoftAPI_participant_participantFirstNameLastName(firstNameNotTrimmed, lastNameNotTrimmed), "/api/contacts?dcyfId&firstName=[FirstName]&lastName=[LastName]&trimmed=false&doubleEncoded=false", new Date(), parameters);
                //       } catch (e) {
                //         console.error(`attempt 2 of 5 - error looking up by NOT TRIMMED First Name + Last Name (id ${participantId})`);
                //       }
                //     } else {
                //       console.error(`name split not trimmed does not have exactly two indexes`);
                //     }
                //   },200);
                // }

                console.log(`DATA-2 : ${!!data}`);
                if (!data) {
                  await setTimeout(async () => {
                    console.log(`Attempting 3 of 5 - Participant First Name + Last Name - Trimmed (${participantId})`);
                    const nameSplitTrimmed = participantName.split(',').map((item) => item.trim());
                    if (nameSplitTrimmed.length === 2) {
                      const firstNameTrimmed = nameSplitTrimmed[1];
                      const lastNameTrimmed = nameSplitTrimmed[0];
                      parameters.firstNameTrimmed = firstNameTrimmed;
                      parameters.lastNameTrimmed = lastNameTrimmed;
                      try {
                        data = await runMulesoftAPIRequest_GET(generateMulesoftAPI_participant_participantFirstNameLastName(firstNameTrimmed, lastNameTrimmed), "/api/contacts?dcyfId&firstName=[FirstName]&lastName=[LastName]&trimmed=true&doubleEncoded=false", new Date(), parameters);
                      } catch (e) {
                        console.error(`attempt 3 of 5 - error looking up by TRIMMED First Name + Last Name (id ${participantId})`);
                      }
                    } else {
                      console.error(`name split trimmed does not have exactly two indexes`);
                    }
                  },200);
                }

                // console.log(`DATA-3 : ${!!data}`);
                // if (!data) {
                //   await setTimeout(async () => {
                //     console.log(`Attempting 4 of 5 - Participant First Name + Last Name - Not Trimmed + Double Encoded (${participantId})`);
                //     const nameSplitNotTrimmedDoubleEncoded = participantName.split(',').map((item) => encodeURIComponent(item));
                //     if (nameSplitNotTrimmedDoubleEncoded.length === 2) {
                //       const firstNameNotTrimmedDoubleEncoded = encodeURIComponent(nameSplitNotTrimmedDoubleEncoded[1]);
                //       const lastNameNotTrimmedDoubleEncoded = encodeURIComponent(nameSplitNotTrimmedDoubleEncoded[0]);
                //       parameters.firstNameNotTrimmedDoubleEncoded = firstNameNotTrimmedDoubleEncoded;
                //       parameters.lastNameNotTrimmedDoubleEncoded = lastNameNotTrimmedDoubleEncoded;
                //       try {
                //         data = await runMulesoftAPIRequest_GET(generateMulesoftAPI_participant_participantFirstNameLastName(firstNameNotTrimmedDoubleEncoded, lastNameNotTrimmedDoubleEncoded), "/api/contacts?dcyfId&firstName=[FirstName]&lastName=[LastName]&trimmed=false&doubleEncoded=true", new Date(), parameters);
                //       } catch (e) {
                //         console.error(`attempt 4 of 5 - error looking up by NOT TRIMMED AND DOUBLE ENCODED First Name + Last Name (id ${participantId})`);
                //       }
                //     } else {
                //       console.error(`name split trimmed does not have exactly two indexes`);
                //     }
                //   },200);
                // }
                //
                // console.log(`DATA-4 : ${!!data}`);
                // if (!data) {
                //   await setTimeout(async () => {
                //     console.log(`Attempting 5 of 5 - Participant First Name + Last Name - Trimmed + Double Encoded (${participantId})`);
                //     const nameSplitTrimmedDoubleEncoded = participantName.split(',').map((item) => encodeURIComponent(item.trim()));
                //     if (nameSplitTrimmedDoubleEncoded.length === 2) {
                //       const firstNameTrimmedDoubleEncoded = encodeURIComponent(nameSplitTrimmedDoubleEncoded[1]);
                //       const lastNameTrimmedDoubleEncoded = encodeURIComponent(nameSplitTrimmedDoubleEncoded[0]);
                //       parameters.firstNameTrimmedDoubleEncoded = firstNameTrimmedDoubleEncoded;
                //       parameters.lastNameTrimmedDoubleEncoded = lastNameTrimmedDoubleEncoded;
                //       try {
                //         data = await runMulesoftAPIRequest_GET(generateMulesoftAPI_participant_participantFirstNameLastName(firstNameTrimmedDoubleEncoded, lastNameTrimmedDoubleEncoded), "/api/contacts?dcyfId&firstName=[FirstName]&lastName=[LastName]&trimmed=true&doubleEncoded=true", new Date(), parameters);
                //       } catch (e) {
                //         console.error(`attempt 5 of 5 - error looking up by TRIMMED AND DOUBLE ENCODED First Name + Last Name (id ${participantId})`);
                //       }
                //     } else {
                //       console.error(`name split trimmed does not have exactly two indexes`);
                //     }
                //   }, 200);
                // }


                // console.log('-------1');
                // console.log(data);
                // console.log('-------2');


                console.log(`DATA-5 : ${!!data}`);
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