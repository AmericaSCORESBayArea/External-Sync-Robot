import fs from 'fs';
import createBrowser from "./createBrowser";
import closeBrowser from "./closeBrowser";
import generateAvailableCommandsString from "../modules/generateAvailableCommandsString";
import getConfigurationValueByKey from "../modules/getConfigurationValueByKey";
import navigateToURL from "./navigateToURL";
import setBrowserTimeouts from "./setBrowserTimeouts";
import waitUntilLocation from "./waitUntilLocation";
import getTextFileContent from "../modules/getTextFileContent";

const availableCommands = [
  {
    name: "district_1_participants",
    browserScriptPath: `district_1/participants/01_get_existing_participants.js`,
    startingURL:getConfigurationValueByKey("DISTRICT_1_ENTRY_POINT_URL"),
    scriptReadyURL:getConfigurationValueByKey("DISTRICT_1_SCRIPT_READY_URL")
  },
  {
    name: "district_1_teams",
    browserScriptPath: `district_1/teams/01_get_existing_teams_and_schedule_and_attendance.js`,
    startingURL:getConfigurationValueByKey("DISTRICT_1_ENTRY_POINT_URL"),
    scriptReadyURL:getConfigurationValueByKey("DISTRICT_1_SCRIPT_READY_URL")
  },
  {
    name: "district_2_participants",
    browserScriptPath: `district_2/participants/01_get_existing_participants.js`,
    startingURL:getConfigurationValueByKey("DISTRICT_2_ENTRY_POINT_URL"),
    scriptReadyURL:getConfigurationValueByKey("DISTRICT_2_SCRIPT_READY_URL")
  },
  {
    name: "district_2_teams",
    browserScriptPath: `district_2/participants/01_get_existing_teams_and_schedule.js`,
    startingURL:getConfigurationValueByKey("DISTRICT_2_ENTRY_POINT_URL"),
    scriptReadyURL:getConfigurationValueByKey("DISTRICT_2_SCRIPT_READY_URL")
  }
];

const runBrowserScriptFromFile = (parameters) => {
  if (parameters.length > 1) {
    const requestedSecondaryCommand = parameters[1];
    const matchingSecondaryCommand = availableCommands.filter((item) => !!item.name && item.name === requestedSecondaryCommand);
    if (matchingSecondaryCommand.length > 0) {
      const {browserScriptPath,startingURL,scriptReadyURL,name} = matchingSecondaryCommand[0];
      if (!!browserScriptPath && !!startingURL && !!name && !!scriptReadyURL) {
        return new Promise(async (resolve, reject) => {
          try {
            const browser = await createBrowser();
            await setBrowserTimeouts(browser);
            await navigateToURL(browser, startingURL);
            const results = await waitUntilLocation(browser,scriptReadyURL);
            if (results === true) {
              const scriptContentToRunInBrowser = await getTextFileContent(browserScriptPath);
              if (!!scriptContentToRunInBrowser) {
                const result = await browser.executeScript(scriptContentToRunInBrowser, 100);
                console.log(`....script completed`);
                console.log(result);

                // const data = browser.executeScript()
                // setTimeout(async () => {
                //   const result_2 = await browser.executeScript(scriptContentToRunInBrowser);
                //
                //   console.log(`....script completed-----2`);
                //   console.log(result_2);
                //
                //
                // },20000);
                // console.log(`....closing the browser`);
                // await closeBrowser(browser);
                // resolve(true);
              } else {
                console.error(`error getting browser script content from : ${browserScriptPath}`);
              }
            }
          } catch (e) {
            console.error("error running browser script");
            console.error(e);
            reject(e);
          }
        });
      } else {
        console.error("error with configuration - all these must be defined : browserScriptPath,startingURL,scriptReadyURL,name - this is what was found : ");
        console.error(matchingSecondaryCommand[0]);
        console.error("please check");
      }
    } else {
      console.log(`no matching secondary command for the request : ${requestedSecondaryCommand}`);
      console.log(generateAvailableCommandsString(availableCommands));
    }
  } else  {
    console.error(`for the main command "${parameters[0]}", a secondary command is required`);
    console.log(generateAvailableCommandsString(availableCommands));
  }
};

export default runBrowserScriptFromFile;