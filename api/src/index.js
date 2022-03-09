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
import insertManyDocuments from "./mongo/insertMany";
import insertOne from "./mongo/insertOne";

const runMongoInitialization = () => {
  console.log("Running Mongo Initialization after a timeout...")
  setTimeout(() => {
    console.log("Creating MongoDB Indices...")
    exec(`cd ../mongodb/scripts/ && /bin/bash createAllIndices.sh`, (err, stdout, stderr) => {
      console.log("Done with MongoDB Indices Script...")
      if (err) console.error(err)
      if (stderr) console.error(stderr)
      console.log(stdout)
    });

    console.log("Creating MongoDB Views...")
    exec(`cd ../mongodb/scripts/ && /bin/bash createAllViews.sh`, (err, stdout, stderr) => {
      console.log("Done with MongoDB Views Script...")
      if (err) console.error(err)
      if (stderr) console.error(stderr)
      console.log(stdout)
    });
  },10000)
}

//todo "District 2" ->  set "Is youth a parent?" to "N"

const app = express();
app.use(bp.urlencoded({extended: true}));
app.use(bp.json({limit: '50mb', extended: true}));
app.use(bp.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

const corsUIOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200
};

const corsAll = {
  origin: "*",
  optionsSuccessStatus: 200
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

app.get('/grid-status',cors(corsUIOptions), async (req, res) => {
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
    const {data, status} = response
    if (data && status) {
      responseData = data
      responseStatus = status
    }
  } catch (e) {
    console.error("Server API Response Error for Grid Status")
    console.error(e)
    responseData = {};
    responseStatus = 502;
  }
  res.status(responseStatus).json(responseData)
});

app.options('/run',cors(corsUIOptions), async (req, res) => res.status(200).json());
app.post('/run', cors(corsUIOptions), async (req, res) => {
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

app.options('/browser-data',cors(corsAll), async (req, res) => res.status(200).json());
app.post('/browser-data',cors(corsAll), async (req, res) => {
  console.log("Browser Data Received...")
  if (req.body) {
    const {destinationMongoCollection, destinationData} = req.body
    console.log(req.body)
    if (destinationMongoCollection && destinationData) {
      try {
        await insertManyDocuments(destinationMongoCollection, destinationData);
        console.log("new data inserted")
      } catch(e) {
        console.error("error inserting browser data")
        console.error(e)
      }
    }
  }
  res.status(200).json()
});

app.options('/browser-log',cors(corsAll), async (req, res) => res.status(200).json());
app.post('/browser-log',cors(corsAll), async (req, res) => {
  if (req.body) {
    const {command, message,type, instanceDate} = req.body
    if (command && message && type && instanceDate) {
      try {
        await insertOne(`browser_logs`, {
          command,
          message,
          type,
          instanceDate,
          date:new Date()
        });
      } catch(e) {
        console.error("error inserting browser data")
        console.error(e)
      }
    }
  }
  res.status(200).json()
});

app.listen(process.env.API_PORT, err => {
  if (err) throw err;
  console.log("%c Sync Robot API Server running", "color: green");
});

runMongoInitialization()