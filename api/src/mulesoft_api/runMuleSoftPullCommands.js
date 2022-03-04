import generateAvailableCommandsString from "../modules/generateAvailableCommandsString";
import get_contact_data from "./get_contact_data";
import get_coach_data from "./get_coach_data";
import get_coach_session_data from "./get_coach_session_data";
import get_all_enrollments from "./get_all_enrollments";
import get_all_attendances from "./get_all_attendances";

const availableCommands = [
  {
    name: "get_contact_data",
    entryPoint: get_contact_data
  },
  {
    name: "get_coach_data",
    entryPoint: get_coach_data
  },
  {
    name: "get_coach_session_data",
    entryPoint: get_coach_session_data
  },
  {
    name: "get_all_enrollments",
    entryPoint: get_all_enrollments
  },
  {
    name: "get_all_attendances",
    entryPoint: get_all_attendances
  },

  // THESE COMMAND SHOULD ONLY BE ENABLED WHEN PULLING FROM DISTRICT AND PUSHING TO SALESFORCE
  // THE DEFAULT MODE IS SALESFORCE POPULATES DISTRICT
  // import list_participants_in_district_not_in_salesforce from "./list_participants_in_district_not_in_salesforce";
  // import post_new_participants_to_salesforce from "./post_new_participants_to_salesforce";
  // import post_missing_session_dates_to_salesforce from "./post_missing_session_dates_to_salesforce";
  // import post_missing_enrollments_to_salesforce from "./post_missing_enrollments_to_salesforce";
  // import post_all_attendances_to_salesforce from "./post_all_attendances_to_salesforce";
  //
  // {
  //   name: "post_new_participants_to_salesforce",
  //   entryPoint: post_new_participants_to_salesforce
  // },
  // {
  //   name: "post_missing_session_dates_to_salesforce",
  //   entryPoint: post_missing_session_dates_to_salesforce
  // },
  // {
  //   name: "post_missing_enrollments_to_salesforce",
  //   entryPoint: post_missing_enrollments_to_salesforce
  // },
  // {
  //   name: "post_all_attendances_to_salesforce",
  //   entryPoint: post_all_attendances_to_salesforce
  // }
];

const runMuleSoftPullCommands = async (parameters) => {
  if (parameters.length > 1) {
    const requestedSecondaryCommand = parameters[1];
    const matchingSecondaryCommand = availableCommands.filter((item) => !!item.name && item.name === requestedSecondaryCommand);
    if (matchingSecondaryCommand.length > 0) {
      const {
        name,
        entryPoint
      } = matchingSecondaryCommand[0];
      if (!!name && !!entryPoint) {
        return await new Promise(async (resolve, reject) => {
          try {
            resolve(await matchingSecondaryCommand[0].entryPoint())
          } catch (e) {
            console.log("error with MuleSoft Pull Command")
            console.error(e)
            reject(e)
          }
        });
      } else {
        console.error("error with configuration - all these must be defined : name,entryPoint - this is what was found : ");
        console.error(matchingSecondaryCommand[0]);
        console.error("please check");
      }
    } else {
      console.log(`no matching secondary command for the request : ${requestedSecondaryCommand}`);
      console.log(generateAvailableCommandsString(availableCommands));
    }
  } else {
    console.error(`for the main command "${parameters[0]}", a secondary command is required`);
    console.log(generateAvailableCommandsString(availableCommands));
  }
};

export default runMuleSoftPullCommands;