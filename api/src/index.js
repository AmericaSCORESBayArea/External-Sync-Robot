import "core-js/stable";
import "regenerator-runtime/runtime";
import runBrowserScriptFromFile from "./selenium/runBrowserScriptFromFile";
import getCLIArguments from "./modules/getCLIArguments";
import generateAvailableCommandsString from "./modules/generateAvailableCommandsString";
import get_contact_data from "./mulesoft_api/get_contact_data";
import get_coach_data from "./mulesoft_api/get_coach_data";
import get_coach_session_data from "./mulesoft_api/get_coach_session_data";
import get_all_enrollments from "./mulesoft_api/get_all_enrollments";
import get_all_attendances from "./mulesoft_api/get_all_attendances";
import list_participants_in_district_not_in_salesforce from "./mulesoft_api/list_participants_in_district_not_in_salesforce";
import post_new_participants_to_salesforce from "./mulesoft_api/post_new_participants_to_salesforce";
import post_missing_session_dates from "./mulesoft_api/post_missing_session_dates";
import post_missing_enrollments from "./mulesoft_api/post_missing_enrollments";
import post_all_attendances from "./mulesoft_api/post_all_attendances";

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
    name: "get_all_enrollments",
    entryPoint: get_all_enrollments
  },
  {
    name: "get_all_attendances",
    entryPoint: get_all_attendances
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
    name: "post_missing_enrollments",
    entryPoint: post_missing_enrollments
  },
  {
    name: "post_all_attendances",
    entryPoint: post_all_attendances
  }
];

const main = () => {
  console.log(`Started : ${new Date()}`);
  console.log(`....CLI Arguments : ${cliArguments.join(", ")}`);
  if (cliArguments.length > 0) {
    return new Promise(async () => {
      const requestedCommand = cliArguments[0];
      const matchingEntryPoint = availableCommands.filter((item) => !!item.name && item.name === requestedCommand);
      if (matchingEntryPoint.length > 0) {
        try {
          await matchingEntryPoint[0].entryPoint(cliArguments);
        } catch (err) {
          console.error("unknown error in main---1");
          console.error(err);
        }
      } else {
        console.log(`no matching command for the request : ${requestedCommand}`);
        console.log(generateAvailableCommandsString(availableCommands));
      }
    })
  } else {
    console.log("must pass in at least one argument");
    console.log(generateAvailableCommandsString(availableCommands));
  }
};

//main entry point
main().then((res, err) => {
  if (!!err) {
    console.error("unknown error in main---2");
    console.error(err);
  }
  if (!!res) {
    console.log(res);
  }
}).catch((err) => {
  console.error("unknown error in main---3");
  console.error(err);
}).then(() => {
  console.log(`Done - ${new Date()}`);
});