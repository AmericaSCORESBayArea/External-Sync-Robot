import "core-js/stable";
import "regenerator-runtime/runtime";
import express from "express";
import * as bp from 'body-parser';
import axios from "axios";
import cors from 'cors';
import { exec } from "child_process";
import runBrowserScrapeCommands from "./selenium/runBrowserScrapeCommands";
import runBrowserPushCommands from "./selenium/runBrowserPushCommands";
import generateAvailableCommandsString from "./modules/generateAvailableCommandsString";
import runMuleSoftPullCommands from "./mulesoft_api/runMuleSoftPullCommands";
import {insertDocuments} from "mongodb/lib/operations/common_functions";

exec(`cd ../mongodb/scripts/ && /bin/bash createAllIndices.sh`,(err, stdout, stderr) => {
  console.log(err)
  console.log(stdout)
  console.log(stderr)
});

exec(`cd ../mongodb/scripts/ && /bin/bash createAllViews.sh`,(err, stdout, stderr) => {
  console.log(err)
  console.log(stdout)
  console.log(stderr)
});

//todo "District 2" ->  set "Is youth a parent?" to "N"

const PORT = 4000;

const app = express();
app.use(bp.json());
app.use(bp.urlencoded({extended: true}));

const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

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

app.get('/grid-status',cors(corsOptions), async (req, res) => {
  let responseData
  let responseStatus
  try {
    const response = await axios.post(`http://${process.env.SELENIUM_HOST}:${process.env.SELENIUM_PORT}/graphql`,
      {
        "operationName": "Summary",
        "variables": {},
        "query": `
            query Summary {
              grid {
                uri
                totalSlots
                nodeCount
                maxSession
                sessionCount
                sessionQueueSize
                version
              }
            }`
      })
      .then((res, err) => {
        if (err) console.error(err)
        return res
      }).catch((err) => {
        console.error(err)
      })
    responseData = response.data
    responseStatus = response.status
  } catch(e) {
    console.error("Server API Response Error for Grid Status")
    console.error(e)
    responseData = {};
    responseStatus = 502;
  }
  res.status(responseStatus).json(responseData)
});

app.options('/run',cors(corsOptions), async (req, res) => res.status(200).json());

app.post('/run', cors(corsOptions), async (req, res) => {
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

app.options('/browser-data',cors(corsOptions), async (req, res) => res.status(200).json());
app.post('/browser-data',cors(corsOptions), async (req, res) => {
  if (req.body) {
    const {destinationMongoCollection, destinationData} = req.body
    if (destinationMongoCollection && destinationData) {
      try {
        await insertDocuments(destinationMongoCollection, destinationData);
        console.log("new data inserted")
      } catch(e) {
        console.error("error inserting browser data")
        console.error(e)
      }
    }
  }
  res.status(200).json()
});

// const databases = queryDocuments()
// ARG mongoscriptsdir=$appdir/mongodb/scripts
// WORKDIR $mongoscriptsdir
// RUN /bin/bash createAllIndices.sh
// RUN /bin/bash createAllViews.sh


app.listen(PORT, err => {
  if (err) throw err;
  console.log("%c Sync Robot API Server running", "color: green");
});
