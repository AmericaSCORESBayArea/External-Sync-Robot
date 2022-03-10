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
import insertOneDocument from "./mongo/insertOne";

const runMongoInitialization = () => {
  console.log("Running Mongo Initialization after a timeout...")
  setTimeout(() => {
    setTimeout(() => {
      console.log("Creating MongoDB Indices...")
      exec(`cd ../mongodb/scripts/ && /bin/bash createAllIndices.sh`, (err, stdout, stderr) => {
        console.log("Done with MongoDB Indices Script...")
        if (err) console.error(err)
        if (stderr) console.error(stderr)
        console.log(stdout)
      });
    }, 5000)

    setTimeout(() => {
      console.log("Creating MongoDB Views...")
      exec(`cd ../mongodb/scripts/ && /bin/bash createAllViews.sh`, (err, stdout, stderr) => {
        console.log("Done with MongoDB Views Script...")
        if (err) console.error(err)
        if (stderr) console.error(stderr)
        console.log(stdout)
      });
    }, 10000)

    setTimeout(() => {
      console.log("Adding Default MongoDB Data to Collections...")
      exec(`cd ../mongodb/scripts/ && /bin/bash addDefaultData.sh`, (err, stdout, stderr) => {
        console.log("Done with MongoDB Add Default Data Script...")
        if (err) console.error(err)
        if (stderr) console.error(stderr)
        console.log(stdout)
      });
    }, 20000)
  }, 10000)
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

const addLog = async ({command, message, type, instanceDate}) => {
  try {
    await insertOne(`browser_logs`, {
      command,
      message,
      type,
      instanceDate,
      date: new Date()
    });
  } catch (e) {
    console.error("error inserting browser data")
    console.error(e)
  }
};

async function * commandGenerator (commands,instanceDate) {
  let intCurrentCommand = 0;
  while (intCurrentCommand < commands.length) {
    const command = commands[intCurrentCommand];
    const {primary_command, secondary_command} = command;
    const cliArguments = [primary_command, secondary_command]
    console.log(`....CLI Arguments : ${cliArguments.join(", ")}`);
    if (!cliArguments.length) {
      await addLog({
        command,
        message:`must pass in at least one argument. Available commands :${generateAvailableCommandsString(availableCommands)}`,
        type:"message",
        instanceDate
      });
    }
    if (cliArguments.length) {
      const requestedCommand = cliArguments[0];
      const matchingEntryPoint = availableCommands.filter((item) => !!item.name && item.name === requestedCommand);
      if (!matchingEntryPoint.length) {
        await addLog({
          command,
          message:`no matching command for the request ${requestedCommand}. Available commands : ${generateAvailableCommandsString(availableCommands)}`,
          type:"message",
          instanceDate
        });
      }
      if (matchingEntryPoint.length) {
        try {
          await matchingEntryPoint[0].entryPoint(cliArguments);
        } catch (err) {
          console.error(err);
          await addLog({
            command,
            message:"unknown error in main---1",
            type:"message",
            instanceDate
          });
        }
      }
    }
    yield intCurrentCommand
    intCurrentCommand++
  }
}

const main = async (requestBody) => {
  const {commands} = requestBody
  const instanceDate = new Date().toISOString();
  let intCommandsRunCount = 0;
  if (commands && Array.isArray(commands) && commands.length > 0) {
    const yieldedCommands = commandGenerator(commands, instanceDate);
    let blContinueCommands = true;
    while (blContinueCommands) {
      intCommandsRunCount++
      if (intCommandsRunCount < commands.length) {
        await addLog({
          command:commands,
          message: `Running Next Command ${commands[intCommandsRunCount - 1]} : ${intCommandsRunCount} of ${commands.length}`,
          type: "message",
          instanceDate
        });
      }
      if (intCommandsRunCount >= commands.length) {
        await addLog({
          command:commands,
          message: `All ${commands.length} Commands Complete!`,
          type: "message",
          instanceDate
        });
      }
      const {done} = await yieldedCommands.next();
      if (done) blContinueCommands=false
    }
  } else {
    await addLog({
      command:commands,
      message: "at least one command must be passed",
      type: "message",
      instanceDate
    });
  }
  return intCommandsRunCount
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
    const execution = main(req.body).then().catch().then();
    if (execution) {
      console.log("execution started")
    }
  }
  res.status(200).json({result: "commanFd received"});
})

app.options('/browser-data',cors(corsAll), async (req, res) => res.status(200).json());
app.post('/browser-data',cors(corsAll), async (req, res) => {
  console.log("Browser Data Received...")
  if (req.body) {
    const {destinationMongoCollection, destinationData} = req.body
    console.log(req.body)
    if (destinationMongoCollection && destinationData) {
      try {
        console.log(`Target Collection : ${destinationMongoCollection}`);
        if (!Array.isArray(destinationData)) {
          console.log("Data is not an array - inserting 1 document...")
          await insertOneDocument(destinationMongoCollection, destinationData)
        }
        if (Array.isArray(destinationData) && destinationData.length) {
          console.log(`Data is an array - inserting ${destinationData.length} document${destinationData.length !== 1 ? "s" : ""}...`)
          await insertManyDocuments(destinationMongoCollection, destinationData)
        }
        console.log("New browser data inserted successfully!")
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
    if (command && message && type && instanceDate) await addLog({command,message,type,instanceDate})
  }
  res.status(200).json()
});

app.listen(process.env.API_PORT, err => {
  if (err) throw err;
  console.log("%c Sync Robot API Server running", "color: green");
});

runMongoInitialization()