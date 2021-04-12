import queryDocuments from "../mongo/query";
import runMulesoftAPIRequest_POST from "../modules/runMulesoftAPIRequest_POST";
import generateMulesoftAPI_participant_post_new from "../modules/generateMulesoftAPI_participant_post_new";
import generateConfigObjFromListOfKeys from "../modules/dot-env-configuration/generateConfigObjFromListOfKeys";

const districtToSalesforceExtraFieldMapping = {
  "Zip" : "MailingZip",
  "Date of Birth" : "Birthdate",
};

const post_new_participants_to_salesforce = async () => {
  const districtToSFMapping = generateConfigObjFromListOfKeys(["DISTRICT_KEY_NAME", "DISTRICT_SF_SYSTEM_NAME"]);
  if (!!districtToSFMapping && districtToSFMapping.length > 0) {
    const requestDate = new Date();
    return await new Promise(async (resolve, reject) => {
      try {
        console.log(`Starting Post New Participants Command...`);
        const missingParticipants = await queryDocuments(`mulesoft_api_responses_participants_not_found_view`, {});
        if (!!missingParticipants && missingParticipants.length > 0) {
          console.log(`Count : ${missingParticipants.length} Participants to add to Salesforce...`);
          resolve(Promise.all(missingParticipants.map(async (item, index) => {
            return new Promise((resolve_2) => {
              setTimeout(async () => {
                console.log(`Running Post for ${index + 1} of ${missingParticipants.length} - ${item.participant}`);
                const {participant, participantId, district, formValues} = item;
                if (!!participant && !!participantId && !!district && !!formValues) {
                  const fullNameSplit = item.participant.split(",").map((item_2) => `${item_2.trim()}`);
                  const matchingSFSystems = districtToSFMapping.filter((item_2) => !!item_2.DISTRICT_SF_SYSTEM_NAME && !!item_2.DISTRICT_KEY_NAME && item_2.DISTRICT_KEY_NAME === district).map((item_2) => item_2.DISTRICT_SF_SYSTEM_NAME);
                  if (matchingSFSystems.length === 1) {
                    if (fullNameSplit.length === 2) {
                      const postRequestFields = {
                        "OtherLang": "",
                        "Emergency_Contact_Phone3": "",
                        "Gender": "",
                        "Emergency_Contact_Name": "",
                        "ParentHomeLang": "",
                        "Second_Emergency_Contact_Phone1": "",
                        "Relationship": "",
                        "ParentPhone1": "",
                        "Emergency_Contact_Phone2": "",
                        "ParentLName": "",
                        "LiabilityWaiver": false,
                        "Ethnicity": "",
                        "Second_Emergency_Contact_Relationship": "",
                        "SchoolName": "",
                        "PermissiontoCommuteAlone": "",
                        "MailingStreet": "",
                        "Volunteer": "",
                        "Grade": "",
                        "Second_Emergency_Contact_Name": "",
                        "ExternalStudentIdSource": `${matchingSFSystems[0]}`,
                        "DataReleaseWaiver": false,
                        "MailingCity": "",
                        "MediaReleaseWaiver": false,
                        "ParentEnglishFluency": "",
                        "Second_Emergency_Contact_Phone3": "",
                        "MailingCountry": "",
                        "MailingZip": 0,
                        "ParentPhone3": "",
                        "Emergency_Contact_Phone1": "",
                        "ReducedPriceLunch": "",
                        "ExternalStudentId": `${participantId}`,
                        "Allergies": "",
                        "Birthdate": "2020-01-02",
                        "ContactRecordType": "",
                        "Second_Emergency_Contact_Permission_to_Pickup_child": "",
                        "Emergency_Contact_Relationship": "",
                        "ParentEmail": "",
                        "Emergency_Contact_Permission_to_Pickup_child": "",
                        "ParentFName": "",
                        "ParentPhone2": "",
                        "LastName": `${fullNameSplit[0].trim()}`,
                        "MailingState": "",
                        "PersonalEmail": "",
                        "Second_Emergency_Contact_Phone2": "",
                        "MiddleName": "",
                        "FirstName": `${fullNameSplit[1].trim()}`,
                        "HomePhone": ""
                      };
                      Object.keys(districtToSalesforceExtraFieldMapping).map((item_2) => {
                        const currentFormValue = item.formValues[item_2];
                        if (!!currentFormValue) {
                          let valueToPass = currentFormValue;
                          if (item_2 === "Date of Birth") {
                            const dobSplit = currentFormValue.split("/").map((item) => item.trim());
                            if (dobSplit.length === 3) {
                              const yearStr = `${dobSplit[2]}`;
                              const monthStr = dobSplit[0].length === 1 ? `0${dobSplit[0]}` : `${dobSplit[0]}`;
                              const dateOfMonthStr = dobSplit[1].length === 1 ? `0${dobSplit[1]}` : `${dobSplit[1]}`;
                              valueToPass = `${yearStr}-${monthStr}-${dateOfMonthStr}`;
                            }
                          }
                          if (item_2 === "Zip") {
                            valueToPass = parseInt(currentFormValue);
                          }
                          postRequestFields[districtToSalesforceExtraFieldMapping[item_2]] = valueToPass;
                        }
                      });
                      try {
                        resolve_2(await runMulesoftAPIRequest_POST(generateMulesoftAPI_participant_post_new(), "api/contacts", requestDate, postRequestFields));
                      } catch (e) {
                      resolve_2(null);
                      }
                    } else {
                      console.error(`Participant Name does not look right - ${JSON.stringify(item)}`);
                    }
                  } else {
                    console.error(`Expecting exactly one matching SF District Mapping - found ${matchingSFSystems.length}`);
                  }
                } else {
                  console.error(`Not all required fields are found - participant, participantId, district, formValues - , cannot run this one - ${JSON.stringify(item)}`);
                }
                resolve(false);
              }, 2000 * (index + 1));
            });
          })));
        } else {
          resolve("No Coach Ids found to query against");
        }
        resolve(true);
      } catch (e) {
        reject(e);
      }
    });
  } else {
    console.error(`districtToSFMapping not generated or invalid - please check`);
  }
};

export default post_new_participants_to_salesforce;