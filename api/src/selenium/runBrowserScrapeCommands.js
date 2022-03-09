import createBrowser from "./createBrowser";
import generateAvailableCommandsString from "../modules/generateAvailableCommandsString";
import getConfigurationValueByKey from "../modules/dot-env-configuration/getConfigurationValueByKey";
import navigateToURL from "./navigateToURL";
import waitUntilLocation from "./waitUntilLocation";
import getTextFileContent from "../modules/getTextFileContent";

const availableCommands = [
  {
    name: "district_1_participants",
    loginScriptPath: `district_1/login/login.js`,
    loginParamUserName:`DISTRICT_1_USERNAME`,
    loginParamPassword:`DISTRICT_1_PASSWORD`,
    browserScriptPath: `district_1/participants/01_get_existing_participants.js`,
    startingURL:getConfigurationValueByKey("DISTRICT_1_ENTRY_POINT_URL"),
    scriptReadyURL:getConfigurationValueByKey("DISTRICT_1_SCRIPT_READY_URL"),
    destinationMongoCollection:`district_participants`
  },
  {
    name: "district_1_participant",
    loginScriptPath: `district_1/login/login.js`,
    loginParamUserName:`DISTRICT_1_USERNAME`,
    loginParamPassword:`DISTRICT_1_PASSWORD`,
    browserScriptPath: `district_1/participants/04_get_existing_participant.js`,
    startingURL:getConfigurationValueByKey("DISTRICT_1_ENTRY_POINT_URL"),
    scriptReadyURL:getConfigurationValueByKey("DISTRICT_1_SCRIPT_READY_URL"),
    destinationMongoCollection:`district_participants`,
    replaceIds:true
  },
  {
    name: "district_1_teams",
    loginScriptPath: `district_1/login/login.js`,
    loginParamUserName:`DISTRICT_1_USERNAME`,
    loginParamPassword:`DISTRICT_1_PASSWORD`,
    browserScriptPath: `district_1/teams/01_get_existing_teams_and_schedule_and_attendance.js`,
    startingURL:getConfigurationValueByKey("DISTRICT_1_ENTRY_POINT_URL"),
    scriptReadyURL:getConfigurationValueByKey("DISTRICT_1_SCRIPT_READY_URL"),
    destinationMongoCollection:`district_teams`
  },
  {
    name: "district_2_participants",
    loginScriptPath: `district_2/login/login.js`,
    loginParamUserName:`DISTRICT_2_USERNAME`,
    loginParamPassword:`DISTRICT_2_PASSWORD`,
    browserScriptPath: `district_2/participants/01_get_existing_participants.js`,
    startingURL:getConfigurationValueByKey("DISTRICT_2_ENTRY_POINT_URL"),
    scriptReadyURL:getConfigurationValueByKey("DISTRICT_2_SCRIPT_READY_URL"),
    destinationMongoCollection:`district_participants`
  },
  {
    name: "district_2_teams",
    loginScriptPath: `district_2/login/login.js`,
    loginParamUserName:`DISTRICT_2_USERNAME`,
    loginParamPassword:`DISTRICT_2_PASSWORD`,
    browserScriptPath: `district_2/teams/01_get_existing_teams_and_schedule.js`,
    startingURL:getConfigurationValueByKey("DISTRICT_2_ENTRY_POINT_URL"),
    scriptReadyURL:getConfigurationValueByKey("DISTRICT_2_SCRIPT_READY_URL"),
    destinationMongoCollection:`district_teams`
  }
];

const runBrowserScrapeCommands = async (parameters) => {
  if (parameters.length > 1) {
    const requestedSecondaryCommand = parameters[1];
    const matchingSecondaryCommand = availableCommands.filter((item) => !!item.name && item.name === requestedSecondaryCommand);
    if (matchingSecondaryCommand.length > 0) {
      const {
        name,
        loginScriptPath,
        loginParamUserName,
        loginParamPassword,
        browserScriptPath,
        startingURL,
        scriptReadyURL,
        destinationMongoCollection,
        replaceIds
      } = matchingSecondaryCommand[0];
      if (!replaceIds || (replaceIds && parameters.length > 2)) {
        if (!!browserScriptPath && !!loginScriptPath && !!loginParamUserName && !!loginParamPassword && !!startingURL && !!name && !!scriptReadyURL && !!destinationMongoCollection) {
          return await new Promise(async (resolve, reject) => {
            const browser = await createBrowser();
            try {
              await navigateToURL(browser, startingURL);
              try {
                await browser.executeAsyncScript(`${await getTextFileContent(loginScriptPath)}`.split(`!REPLACE_USERNAME`).join(`${getConfigurationValueByKey(`${loginParamUserName}`)}`).split(`!REPLACE_PASSWORD`).join(`${getConfigurationValueByKey(`${loginParamPassword}`)}`), 100).then((res, err) => {
                  if (!!err) {
                    console.error("login response has an error : ");
                    console.error(err);
                  }
                  if (!!res) {
                    console.log("login response received from the script");
                    return res;
                  } else {
                    console.error("no login response received from the script - please check ");
                  }
                  return null;
                });
              } catch (e) {
                console.error("LOGIN ERROR");
                console.error(e);
              }
              const results = await waitUntilLocation(browser, scriptReadyURL);
              if (results === true) {
                const scriptContentToRunInBrowser = await getTextFileContent(browserScriptPath);
                if (!!scriptContentToRunInBrowser) {
                  console.log('script content found : running in selenium browser... please wait for script to finish...');
                  if (replaceIds) {
                    console.log(`REPLACE IDs : ${parameters[2]}`);
                  }
                  const combinedScriptWithAsyncWrapper = `
                  console.log("script content sourced from : ${browserScriptPath}");
                  console.log("start time : " + new Date().toLocaleString());
                  try {
                    /////// script content sourced from : ${browserScriptPath} ///// BEGIN
                    ${scriptContentToRunInBrowser.split(replaceIds ? "!REPLACE_IDS" : " ").join(replaceIds ? parameters[2] : " ").split(`!REPLACE_API_SERVER`).join(`http://api:${process.env.API_PORT}`).split(`!REPLACE_MONGO_COLLECTION`).join(destinationMongoCollection).split('!REPLACE_COMMAND').split('!REPLACE_COMMAND').join(parameters)}
                    /////// script content sourced from : ${browserScriptPath} ///// END
                  } catch(error_main) {
                    console.error("unknown error in main");
                    console.error(error_main);
                  }`;
                  browser.executeAsyncScript(combinedScriptWithAsyncWrapper, 100).then().catch().then()
                  console.log(`scrape script running`);
                } else {
                  console.error(`error getting browser script content from : ${browserScriptPath}`);
                }
              }
            } catch (e) {
              console.error("error running browser script");
              console.error(e);
              reject(e);
            }
            resolve(true);
          });
        } else {
          console.error("error with configuration - all these must be defined : browserScriptPath,loginScriptPath,startingURL,scriptReadyURL,name,destinationMongoCollection - this is what was found : ");
          console.error(matchingSecondaryCommand[0]);
          console.error("please check");
        }
      } else {
        console.error("need to specify a comma-separated list of IDs");
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

export default runBrowserScrapeCommands;