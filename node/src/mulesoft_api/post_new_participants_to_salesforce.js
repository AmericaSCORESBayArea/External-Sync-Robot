import queryDocuments from "../mongo/query";
import runMulesoftAPIRequest_POST from "../modules/runMulesoftAPIRequest_POST";
import generateMulesoftAPI_participant_post_new from "../modules/generateMulesoftAPI_participant_post_new";

const districtToSalesforceExtraFieldMapping = {
  "Zip" : "MailingZip",
  "Person ID" : "DCYFStuID",
  "Date of Birth" : "Birthdate",
};

const post_new_participants_to_salesforce = async () => {
  const requestDate = new Date();
  return await new Promise(async (resolve, reject) => {
    try {
      console.log(`Starting Post New Participants Command...`);
      const missingParticipants = await queryDocuments(`mulesoft_api_responses_participants_not_found_view`, {});
      if (!!missingParticipants && missingParticipants.length > 0) {
        console.log(`Count : ${missingParticipants.length} Participants to add to Salesforce...`);
        resolve(Promise.all(missingParticipants.map(async (item, index) => {
          return new Promise((resolve_2, reject_2) => {
            setTimeout(async () => {
              console.log(`Running Post for ${index + 1} - ${item.participant}`);
              if (!!item.formValues) {
                const fullNameSplit = item.participant.split(",").map((item) => `${item.trim()}`);
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
                    "DCYFStuID": "",
                    "MailingStreet": "",
                    "Volunteer": "",
                    "Grade": "",
                    "Second_Emergency_Contact_Name": "",
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
                    "Allergies": "",
                    "Birthdate": "2020-01-02",
                    "ContactRecordType": "",
                    "Second_Emergency_Contact_Permission_to_Pickup_child": "",
                    "Emergency_Contact_Relationship": "",
                    "ParentEmail": "",
                    "Emergency_Contact_Permission_to_Pickup_child": "",
                    "ParentFName": "",
                    "ParentPhone2": "",
                    "LastName": fullNameSplit[0].trim(),
                    "PersonalEmail": "",
                    "MailingState": "",
                    "Second_Emergency_Contact_Phone2": "",
                    "MiddleName": "",
                    "FirstName": fullNameSplit[1].trim(),
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
                    reject_2(e);
                  }
                } else {
                  console.error(`Participant Name does not look right - ${JSON.stringify(item)}`);
                }
              } else {
                console.error(`No formValues field found on missing participant, cannot run this one - ${JSON.stringify(item)}`);
              }
              resolve(false);
            }, 200 * (index + 1));
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
};

export default post_new_participants_to_salesforce;