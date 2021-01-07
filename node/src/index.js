import "core-js/stable";
import "regenerator-runtime/runtime";
import runBrowserScriptFromFile from "./selenium/runBrowserScriptFromFile";
import {establishDatabaseConnection} from "./mongo/establishDatabaseConnection";
import getCLIArguments from "./modules/getCLIArguments";
import closeDatabaseConnection from "./mongo/closeDatabaseConnection";
import generateAvailableCommandsString from "./modules/generateAvailableCommandsString";
import get_contact_data from "./mulesoft_api/get_contact_data";
import get_coach_data from "./mulesoft_api/get_coach_data";
import get_coach_session_data from "./mulesoft_api/get_coach_session_data";
import list_participants_in_district_not_in_salesforce from "./mulesoft_api/list_participants_in_district_not_in_salesforce";
import post_new_participants_to_salesforce from "./mulesoft_api/post_new_participants_to_salesforce";
import post_missing_session_dates from "./mulesoft_api/post_missing_session_dates";
import post_all_enrollments from "./mulesoft_api/post_all_enrollments";

//todo "District 2" ->  set "Is youth a parent?" to "N"

const cliArguments = getCLIArguments();

const availableCommands = [
  {
    name: "scrape",
    entryPoint: runBrowserScriptFromFile
  },
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
    name: "list_participants_in_district_not_in_salesforce",
    entryPoint: list_participants_in_district_not_in_salesforce
  },
  {
    name: "post_new_participants_to_salesforce",
    entryPoint: post_new_participants_to_salesforce
  },
  {
    name: "post_missing_session_dates",
    entryPoint: post_missing_session_dates
  },
  {
    name: "post_all_enrollments",
    entryPoint: post_all_enrollments
  }
];

//main entry point
const main = () => {
  console.log(`Started : ${new Date()}`);
  console.log(`....CLI Arguments : ${cliArguments.join(", ")}`);
  if (cliArguments.length > 0) {
    const requestedCommand = cliArguments[0];
    const matchingEntryPoint = availableCommands.filter((item) => !!item.name && item.name === requestedCommand);
    if (matchingEntryPoint.length > 0) {
      new Promise(async () => {
        await establishDatabaseConnection(matchingEntryPoint[0].entryPoint,cliArguments)
          .then((res, err) => {
            if (!!err) {
              console.error("unknown error--1 in main");
              console.error(err);
            }
          }).catch((err) => {
            console.error("unknown error--2 in main");
            console.error(err);
          }).then(async () => {
            await closeDatabaseConnection();
            console.log(`Done : ${new Date()}`);
          });
      }).then((res, err) => {
        if (!!err) {
          console.error("unknown error--3 in main");
          console.error(err);
        }
      }).catch((err) => {
        console.error("unknown error--4 in main");
        console.error(err);
      }).then(() => {});
    } else {
      console.log(`no matching command for the request : ${requestedCommand}`);
      console.log(generateAvailableCommandsString(availableCommands));
    }
  } else {
    console.log("must pass in at least one argument");
    console.log(generateAvailableCommandsString(availableCommands));
  }
};

//main entry point
main();