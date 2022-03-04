import "core-js/stable";
import "regenerator-runtime/runtime";
import express from "express";
import * as bp from 'body-parser';
import cors from 'cors';
import runBrowserScrapeCommands from "./selenium/runBrowserScrapeCommands";
import runBrowserPushCommands from "./selenium/runBrowserPushCommands";
import generateAvailableCommandsString from "./modules/generateAvailableCommandsString";
import runMuleSoftPullCommands from "./mulesoft_api/runMuleSoftPullCommands";

//todo "District 2" ->  set "Is youth a parent?" to "N"

const PORT = 4000;

const app = express();
app.use(bp.json());
app.use(bp.urlencoded({extended: true}));

const corsOptions = {
  origin: "http://localhost:3000",
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
    name: "pull",
    entryPoint: runMuleSoftPullCommands
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

app.options('/run',cors(corsOptions), async (req, res) => res.status(200).json());

app.post('/run',cors(corsOptions), async (req, res) => {
  console.log("Run Command Received")
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
  console.log("%c Sync Robot API Server running", "color: green");
});
