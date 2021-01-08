import queryDocuments from "../mongo/query";
import generateMulesoftAPIEndpoint_coach_coachIdAndDate from "../modules/generateMulesoftAPI_coach_coachIdAndDate";
import getConfigurationValueByKey from "../modules/getConfigurationValueByKey";
import runMulesoftAPIRequest_GET from "../modules/runMulesoftAPIRequest_GET";
import runMulesoftAPIRequest_POST from "../modules/runMulesoftAPIRequest_POST";
import generateMulesoftAPI_participant_post_new from "../modules/generateMulesoftAPI_participant_post_new";

const districtToSalesforceExtraFieldMapping = {
  "Zip" : "MailingZip",
  "Person ID" : "DCYFStuID",
  "Date of Birth" : "Birthdate",
};

const salesforceEmptyFieldMappings = [
  "OtherLang",
  "Emergency_Contact_Phone3",
  "Gender",
  "Emergency_Contact_Name",
  "ParentHomeLang",
  "Second_Emergency_Contact_Phone1",
  "Relationship",
  "ParentPhone1",
  "Emergency_Contact_Phone2",
  "ParentLName",
  "LiabilityWaiver",
  "Ethnicity",
  "Second_Emergency_Contact_Relationship",
  "SchoolName",
  "PermissiontoCommuteAlone",
  "MailingStreet",
  "Volunteer",
  "Grade",
  "Second_Emergency_Contact_Name",
  "DataReleaseWaiver",
  "MailingCity",
  "MediaReleaseWaiver",
  "ParentEnglishFluency",
  "Second_Emergency_Contact_Phone3",
  "MailingCountry",
  "ParentPhone3",
  "Emergency_Contact_Phone1",
  "ReducedPriceLunch",
  "Allergies",
  "ContactRecordType",
  "Second_Emergency_Contact_Permission_to_Pickup_child",
  "Emergency_Contact_Relationship",
  "ParentEmail",
  "Emergency_Contact_Permission_to_Pickup_child",
  "ParentFName",
  "ParentPhone2",
  "PersonalEmail",
  "MailingState",
  "Second_Emergency_Contact_Phone2",
  "MiddleName",
  "HomePhone"
];

const post_new_participants_to_salesforce = async () => {
  const requestDate = new Date();
  return await new Promise(async (resolve, reject) => {
    try {
      console.log(`Starting Post New Participants Command...`);
      const missingParticipants = await queryDocuments(`district_participants_not_in_salesforce_view`, {},null,1);
      if (!!missingParticipants && missingParticipants.length > 0) {
        console.log(`Count : ${missingParticipants.length} Missing District Participants in Salesforce...`);
        resolve(Promise.all(missingParticipants.map(async (item, index) => {
          return new Promise((resolve_2,reject_2) => {
            setTimeout(async () => {
              console.log(`Running Post for ${index + 1} - ${item.participant}`);
              if (!!item.formValues) {
                const fullNameSplit = item.participant.split(",").map((item) => `${item.trim()}`);
                if (fullNameSplit.length === 2) {
                  const FirstName = fullNameSplit[1];
                  const LastName = fullNameSplit[0];
                  const postRequestFields = {
                    FirstName,
                    LastName
                  };
                  Object.keys(districtToSalesforceExtraFieldMapping).map((item_2) => {
                    const currentFormValue = item.formValues[item_2];
                    if (!!currentFormValue) {

                      let valueToPass = currentFormValue;
console.log(item_2);
                      if (item_2 === "Date of Birth") {

                        const dobSplit = currentFormValue.split("/").map((item) => item.trim());

                        console.log("DOB HERE IS MORE");
                        console.log(dobSplit);

                        if (dobSplit.length === 3) {
                          console.log("DOB EXTRA IS HERE");

                          valueToPass=`${dobSplit[2]}-${dobSplit[0]}-${dobSplit[1]}`


                          console.log(dobSplit);


                        }

                      }
                      postRequestFields[districtToSalesforceExtraFieldMapping[item_2]] = valueToPass;
                    }
                  });
                  salesforceEmptyFieldMappings.map((item_2) => {
                    postRequestFields[item_2] = "";
                  });
                  try {
                    resolve_2(await runMulesoftAPIRequest_POST(generateMulesoftAPI_participant_post_new(), "api/contact", requestDate, postRequestFields));
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