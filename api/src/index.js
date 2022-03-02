import "core-js/stable";
import "regenerator-runtime/runtime";
import express from "express";
import * as bp from 'body-parser';
import cors from 'cors';
import runBrowserScrapeCommands from "./selenium/runBrowserScrapeCommands";
import runBrowserPushCommands from "./selenium/runBrowserPushCommands";
import generateAvailableCommandsString from "./modules/generateAvailableCommandsString";
import get_contact_data from "./mulesoft_api/get_contact_data";
import get_coach_data from "./mulesoft_api/get_coach_data";
import get_coach_session_data from "./mulesoft_api/get_coach_session_data";
import get_all_enrollments from "./mulesoft_api/get_all_enrollments";
import get_all_attendances from "./mulesoft_api/get_all_attendances";
import list_participants_in_district_not_in_salesforce from "./mulesoft_api/list_participants_in_district_not_in_salesforce";
import post_new_participants_to_salesforce from "./mulesoft_api/post_new_participants_to_salesforce";
import post_missing_session_dates_to_salesforce from "./mulesoft_api/post_missing_session_dates_to_salesforce";
import post_missing_enrollments_to_salesforce from "./mulesoft_api/post_missing_enrollments_to_salesforce";
import post_all_attendances_to_salesforce from "./mulesoft_api/post_all_attendances_to_salesforce";

//todo "District 2" ->  set "Is youth a parent?" to "N"

const PORT = 4000;

const app = express();
app.use(bp.json());
app.use(bp.urlencoded({extended: true}));

const corsOptions = {
  origin: "http://localhost:4000",
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// const cliArguments = getCLIArguments();

const availableCommands = [
  {
    name: "scrape",
    entryPoint: runBrowserScrapeCommands
  },
  {
    name: "push",
    entryPoint: runBrowserPushCommands
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
    name: "post_missing_session_dates_to_salesforce",
    entryPoint: post_missing_session_dates_to_salesforce
  },
  {
    name: "post_missing_enrollments_to_salesforce",
    entryPoint: post_missing_enrollments_to_salesforce
  },
  {
    name: "post_all_attendances_to_salesforce",
    entryPoint: post_all_attendances_to_salesforce
  }
];

const main = (requestBody) => {
  const {primary_command, secondary_command} = requestBody;
  const cliArguments = [primary_command,secondary_command]
  console.log(`Started : ${new Date()}`);
  console.log(`....CLI Arguments : ${cliArguments.join(", ")}`);
  if (cliArguments.length > 0) {
    return new Promise(async (resolve) => {
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
      resolve(true);
    })
  } else {
    console.log("must pass in at least one argument");
    console.log(generateAvailableCommandsString(availableCommands));
  }
};

app.post('/run',cors(corsOptions), async (req, res) => {
  console.log("Run Command Received")
  console.log(req)
  if (req.body) {
    console.log('Request Body Found : ')
    console.log(req.body)
    const execution = main(req.body);
    if (execution) {
      console.log("execution started")
    }
  }
  res.status(200).json({result: "command received"});
})

app.listen(PORT, err => {
  if (err) throw err;
  console.log("%c Server running", "color: green");
});
