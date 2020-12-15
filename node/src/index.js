import "core-js/stable";
import "regenerator-runtime/runtime";
import compare_coach_data from "./mulesoft_api/compare_coach_data";
import {establishDatabaseConnection} from "./mongo/establishDatabaseConnection";
import getCLIArguments from "./modules/getCLIArguments";
import closeDatabaseConnection from "./mongo/closeDatabaseConnection";

const cliArguments = getCLIArguments();

const availableCommands = [
  {
    name: "compare",
    entryPoint: compare_coach_data
  }
];

//main entry point
const main = () => {
  console.log(`Started : ${new Date()}`);
  console.log(`....CLI Arguments : ${cliArguments.join(",")}`);
  if (cliArguments.length > 0) {
    const requestedCommand = cliArguments[0];
    const matchingEntryPoint = availableCommands.filter((item) => !!item.name && item.name === requestedCommand);
    if (matchingEntryPoint.length > 0) {
      new Promise(async () => {
        await establishDatabaseConnection(matchingEntryPoint[0].entryPoint)
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
          });
      }).then((res, err) => {
        if (!!err) {
          console.error("unknown error--3 in main");
          console.error(err);
        }
      }).catch((err) => {
        console.error("unknown error--4 in main");
        console.error(err);
      }).then(() => {
        console.log(`Done : ${new Date()}`);
      });
    } else {
      console.log(`no matching command for the request : ${requestedCommand}`);
      console.log(`available commands : ${availableCommands.map((item, index) => `
    [${index + 1}] ${item.name}`).join()}`);
    }
  } else {
    console.log("must pass in at least one argument");
  }
};

//main entry point
main();