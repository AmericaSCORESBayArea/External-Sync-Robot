import createBrowser from "./createBrowser";
import closeBrowser from "./closeBrowser";
import generateAvailableCommandsString from "../modules/generateAvailableCommandsString";
import getConfigurationValueByKey from "../modules/getConfigurationValueByKey";
import navigateToURL from "./navigateToURL";
import setBrowserTimeouts from "./setBrowserTimeouts";
import waitUntilLocation from "./waitUntilLocation";
import getTextFileContent from "../modules/getTextFileContent";
import insertOneDocument from "../mongo/insertOne";

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

const runBrowserScriptFromFile = async (parameters) => {
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
        destinationMongoCollection
      } = matchingSecondaryCommand[0];
      if (!!browserScriptPath && !!loginScriptPath && !!loginParamUserName && !!loginParamPassword && !!startingURL && !!name && !!scriptReadyURL && !!destinationMongoCollection) {
        return await new Promise(async (resolve, reject) => {
          const browser = await createBrowser();
          await setBrowserTimeouts(browser);
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
            } catch(e) {
              console.error("LOGIN ERROR");
              console.error(e);
            }
            const results = await waitUntilLocation(browser, scriptReadyURL);
            if (results === true) {
              const scriptContentToRunInBrowser = await getTextFileContent(browserScriptPath);
              if (!!scriptContentToRunInBrowser) {
                console.log('script content found : running in selenium browser... please wait for script to finish...');
                const combinedScriptWithAsyncWrapper = `
                  console.log("script content sourced from : ${browserScriptPath}");
                  console.log("start time : " + new Date().toLocaleString());
                  try {
                    /////// script content sourced from : ${browserScriptPath} ///// BEGIN
                    ${scriptContentToRunInBrowser}
                    /////// script content sourced from : ${browserScriptPath} ///// END
                  } catch(error_main) {
                    console.error("unknown error in main");
                    console.error(error_main);
                  }`;
                console.log(`script content generated : 
                
                `);
                console.log(combinedScriptWithAsyncWrapper);
                const result = await browser.executeAsyncScript(combinedScriptWithAsyncWrapper, 100).then((res, err) => {
                  if (!!err) {
                    console.error("response has an error : ");
                    console.error(err);
                  }
                  if (!!res) {
                    console.log("response received from the script");
                    return res;
                  } else {
                    console.error("no response received from the script - please check ");
                  }
                  return null;
                });
                console.log(`script completed`);
                if (!!result) {
                  console.log(`loading response into mongodb collection : ${destinationMongoCollection}`);
                  console.log(JSON.stringify(result));
                  if (Array.isArray(result)) {
                    console.log(`array response was found with ${result.length} items - inserting each as a new document...`);
                    await Promise.all(result.map(async (item, index) => {
                      const newId = await insertOneDocument(destinationMongoCollection, item);
                      console.log(`new mongodb id ${index + 1} of ${result.length} : ${newId}`);
                    }));
                    console.log(`done inserting all ${result.length} documents...`);
                  } else {
                    const newId = await insertOneDocument(destinationMongoCollection, result);
                    console.log(`new mongodb id : ${newId}`);
                  }
                } else {
                  console.log(`no response to load to mongodb`);
                }
              } else {
                console.error(`error getting browser script content from : ${browserScriptPath}`);
              }
            }
          } catch (e) {
            console.error("error running browser script");
            console.error(e);
            reject(e);
          }
          console.log(`....closing the browser`);
          await closeBrowser(browser);
          resolve(true);
        });
      } else {
        console.error("error with configuration - all these must be defined : browserScriptPath,loginScriptPath,startingURL,scriptReadyURL,name,destinationMongoCollection - this is what was found : ");
        console.error(matchingSecondaryCommand[0]);
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

export default runBrowserScriptFromFile;