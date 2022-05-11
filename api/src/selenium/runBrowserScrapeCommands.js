import createBrowser from "./createBrowser";
import generateAvailableCommandsString from "../modules/generateAvailableCommandsString";
import getConfigurationValueByKey from "../modules/dot-env-configuration/getConfigurationValueByKey";
import navigateToURL from "./navigateToURL";
import waitUntilLocation from "./waitUntilLocation";
import getTextFileContent from "../modules/getTextFileContent";
import closeSeleniumBrowser from "./closeBrowser";

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
    name: "district_1_teams_no_attendance",
    loginScriptPath: `district_1/login/login.js`,
    loginParamUserName:`DISTRICT_1_USERNAME`,
    loginParamPassword:`DISTRICT_1_PASSWORD`,
    browserScriptPath: `district_1/teams/01_get_existing_teams_and_schedule_and_attendance.js`,
    startingURL:getConfigurationValueByKey("DISTRICT_1_ENTRY_POINT_URL"),
    scriptReadyURL:getConfigurationValueByKey("DISTRICT_1_SCRIPT_READY_URL"),
    destinationMongoCollection:`district_teams`,
    customOptions:JSON.stringify({attendanceScrape:"exclude"})
  },
  {
    name: "district_1_teams_with_attendance",
    loginScriptPath: `district_1/login/login.js`,
    loginParamUserName:`DISTRICT_1_USERNAME`,
    loginParamPassword:`DISTRICT_1_PASSWORD`,
    browserScriptPath: `district_1/teams/01_get_existing_teams_and_schedule_and_attendance.js`,
    startingURL:getConfigurationValueByKey("DISTRICT_1_ENTRY_POINT_URL"),
    scriptReadyURL:getConfigurationValueByKey("DISTRICT_1_SCRIPT_READY_URL"),
    destinationMongoCollection:`district_teams`,
    customOptions:JSON.stringify({attendanceScrape:"include"})
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
    name: "district_2_teams_no_attendance",
    loginScriptPath: `district_2/login/login.js`,
    loginParamUserName:`DISTRICT_2_USERNAME`,
    loginParamPassword:`DISTRICT_2_PASSWORD`,
    browserScriptPath: `district_2/teams/01_get_existing_teams_and_schedule.js`,
    startingURL:getConfigurationValueByKey("DISTRICT_2_ENTRY_POINT_URL"),
    scriptReadyURL:getConfigurationValueByKey("DISTRICT_2_SCRIPT_READY_URL"),
    destinationMongoCollection:`district_teams`,
    customOptions:JSON.stringify({attendanceScrape:"exclude"})
  },
  {
    name: "district_2_teams_with_attendance",
    loginScriptPath: `district_2/login/login.js`,
    loginParamUserName:`DISTRICT_2_USERNAME`,
    loginParamPassword:`DISTRICT_2_PASSWORD`,
    browserScriptPath: `district_2/teams/01_get_existing_teams_and_schedule.js`,
    startingURL:getConfigurationValueByKey("DISTRICT_2_ENTRY_POINT_URL"),
    scriptReadyURL:getConfigurationValueByKey("DISTRICT_2_SCRIPT_READY_URL"),
    destinationMongoCollection:`district_teams`,
    customOptions:JSON.stringify({attendanceScrape:"include"})
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
        replaceIds,
        customOptions
      } = matchingSecondaryCommand[0];
      if (!replaceIds || (replaceIds && parameters.length > 2)) {
        if (!!browserScriptPath && !!loginScriptPath && !!loginParamUserName && !!loginParamPassword && !!startingURL && !!name && !!scriptReadyURL && !!destinationMongoCollection) {
          return await new Promise(async (resolve) => {
            const browser = await createBrowser().then().catch().then();
            try {
              await navigateToURL(browser, startingURL);
              try {
                console.log(`..logging in`)
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
                }).catch().then();
              } catch (e) {
                console.error("Error logging in!");
                console.error(e);
              }
              const results = await waitUntilLocation(browser, scriptReadyURL);
              if (results === true) {
                console.log(`Login successful!`)
                const scriptContentToRunInBrowser = await getTextFileContent(browserScriptPath).then().catch().then();
                if (!!scriptContentToRunInBrowser) {
                  if (replaceIds) {
                    console.log(`REPLACE IDs : ${parameters[2]}`);
                  }
                  const combinedScriptWithAsyncWrapper = `
                  console.log("script content sourced from : ${browserScriptPath}");
                  console.log("start time : " + new Date().toLocaleString());
                  try {
                    /////// script content sourced from : ${browserScriptPath} ///// BEGIN
                    ${scriptContentToRunInBrowser.split(replaceIds ? "!REPLACE_IDS" : " ").join(replaceIds ? parameters[2] : " ").split(`!REPLACE_API_SERVER`).join(`http://api:${process.env.API_PORT}`).split(`!REPLACE_MONGO_COLLECTION`).join(destinationMongoCollection).split('!REPLACE_COMMAND').join(parameters).split("!REPLACE_CUSTOM_OPTIONS").join(customOptions ? customOptions : "{}")}
                    /////// script content sourced from : ${browserScriptPath} ///// END
                  } catch(error_main) {
                    console.error("unknown error in main");
                    console.error(error_main);
                  }`;
                  console.log("Running Browser Scrape Script.... Please be patient and check the MongoDB logs...")
                  browser.executeAsyncScript(combinedScriptWithAsyncWrapper, 100).then(async () => {
                    console.log(`....closing the browser`);
                    await closeSeleniumBrowser(browser);
                    resolve(true)
                  }).catch(async () => {
                    console.log(`....closing the browser`);
                    await closeSeleniumBrowser(browser)
                    resolve(true)
                  }).then()
                } else {
                  console.error(`error getting browser script content from : ${browserScriptPath}`);
                  resolve(true);
                }
              }
            } catch (e) {
              console.error("error running browser script");
              console.error(e);
              resolve(false);
            }
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