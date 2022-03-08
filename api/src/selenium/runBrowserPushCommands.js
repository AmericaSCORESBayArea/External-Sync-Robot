import createBrowser from "./createBrowser";
import closeBrowser from "./closeBrowser";
import generateAvailableCommandsString from "../modules/generateAvailableCommandsString";
import getConfigurationValueByKey from "../modules/dot-env-configuration/getConfigurationValueByKey";
import navigateToURL from "./navigateToURL";
import waitUntilLocation from "./waitUntilLocation";
import getTextFileContent from "../modules/getTextFileContent";
import queryDocuments from "../mongo/query";
import fs from "fs";

const availableCommands = [
  {
    name: "district_1_teams",
    loginScriptPath: `district_1/login/login.js`,
    loginParamUserName:`DISTRICT_1_USERNAME`,
    loginParamPassword:`DISTRICT_1_PASSWORD`,
    browserScriptPath: `district_1/teams/02_add_missing_teams.js`,
    startingURL:getConfigurationValueByKey("DISTRICT_1_ENTRY_POINT_URL"),
    scriptReadyURL:getConfigurationValueByKey("DISTRICT_1_SCRIPT_READY_URL"),
    sourceMongoCollection:`salesforce_team_seasons_with_missing_district_teams`,
    sourceMongoCollectionQuery:`{"district":"district_1"}`
  },
  {
    name: "district_1_participants",
    loginScriptPath: `district_1/login/login.js`,
    loginParamUserName:`DISTRICT_1_USERNAME`,
    loginParamPassword:`DISTRICT_1_PASSWORD`,
    browserScriptPath: `district_1/participants/02_add_missing_participants.js`,
    startingURL:getConfigurationValueByKey("DISTRICT_1_ENTRY_POINT_URL"),
    scriptReadyURL:getConfigurationValueByKey("DISTRICT_1_SCRIPT_READY_URL"),
    sourceMongoCollection:`salesforce_participants_not_in_district_view`,
    sourceMongoCollectionQuery:`{"$and":[{"district":"district_1"},{"StudentName":{"$not":{"$regex":" stub$", "$options":"i"}}},{"StudentName":{"$not":{"$regex":" stubb$", "$options":"i"}}}]}`
  },
  {
    name: "district_1_schedule",
    loginScriptPath: `district_1/login/login.js`,
    loginParamUserName:`DISTRICT_1_USERNAME`,
    loginParamPassword:`DISTRICT_1_PASSWORD`,
    browserScriptPath: `district_1/teams/03_add_missing_schedule.js`,
    startingURL:getConfigurationValueByKey("DISTRICT_1_ENTRY_POINT_URL"),
    scriptReadyURL:getConfigurationValueByKey("DISTRICT_1_SCRIPT_READY_URL"),
    sourceMongoCollection:`salesforce_sessions_not_in_district_view`,
    sourceMongoCollectionQuery:`{"district":"district_1"}`
  },
  {
    name: "district_1_enrollments",
    loginScriptPath: `district_1/login/login.js`,
    loginParamUserName:`DISTRICT_1_USERNAME`,
    loginParamPassword:`DISTRICT_1_PASSWORD`,
    browserScriptPath: `district_1/teams/04_add_missing_participants.js`,
    startingURL:getConfigurationValueByKey("DISTRICT_1_ENTRY_POINT_URL"),
    scriptReadyURL:getConfigurationValueByKey("DISTRICT_1_SCRIPT_READY_URL"),
    sourceMongoCollection:`salesforce_enrollments_not_in_district_view`,
    sourceMongoCollectionQuery:`{"district":"district_1"}`
  },
  {
    name: "district_1_attendances",
    loginScriptPath: `district_1/login/login.js`,
    loginParamUserName:`DISTRICT_1_USERNAME`,
    loginParamPassword:`DISTRICT_1_PASSWORD`,
    browserScriptPath: `district_1/attendance/01_add_missing_attendance.js`,
    startingURL:getConfigurationValueByKey("DISTRICT_1_ENTRY_POINT_URL"),
    scriptReadyURL:getConfigurationValueByKey("DISTRICT_1_SCRIPT_READY_URL"),
    sourceMongoCollection:`salesforce_attendance_to_set_in_district_1`,
    sourceMongoCollectionQuery:`{}`
  },
  {
    name: "district_2_participants",
    loginScriptPath: `district_2/login/login.js`,
    loginParamUserName:`DISTRICT_2_USERNAME`,
    loginParamPassword:`DISTRICT_2_PASSWORD`,
    browserScriptPath: `district_2/participants/02_add_missing_participants.js`,
    startingURL:getConfigurationValueByKey("DISTRICT_2_ENTRY_POINT_URL"),
    scriptReadyURL:getConfigurationValueByKey("DISTRICT_2_SCRIPT_READY_URL"),
    sourceMongoCollection:`salesforce_participants_not_in_district_view`,
    sourceMongoCollectionQuery:`{"$and":[{"district":"district_2"},{"StudentName":{"$not":{"$regex":" stub$", "$options":"i"}}},{"StudentName":{"$not":{"$regex":" stubb$", "$options":"i"}}}]}`
  },
  {
    name: "district_2_participants_is_youth_a_parent",
    loginScriptPath: `district_2/login/login.js`,
    loginParamUserName:`DISTRICT_2_USERNAME`,
    loginParamPassword:`DISTRICT_2_PASSWORD`,
    browserScriptPath: `district_2/participants/03_set_is_parent_a_youth.js`,
    startingURL:getConfigurationValueByKey("DISTRICT_2_ENTRY_POINT_URL"),
    scriptReadyURL:getConfigurationValueByKey("DISTRICT_2_SCRIPT_READY_URL"),
    sourceMongoCollection:`salesforce_participants_not_in_district_view`,
    sourceMongoCollectionQuery:`{}`
  },
  {
    name: "district_2_enrollments",
    loginScriptPath: `district_2/login/login.js`,
    loginParamUserName:`DISTRICT_2_USERNAME`,
    loginParamPassword:`DISTRICT_2_PASSWORD`,
    browserScriptPath: `district_2/teams/03_add_missing_participants_to_teams.js`,
    startingURL:getConfigurationValueByKey("DISTRICT_2_ENTRY_POINT_URL"),
    scriptReadyURL:getConfigurationValueByKey("DISTRICT_2_SCRIPT_READY_URL"),
    sourceMongoCollection:`salesforce_enrollments_not_in_district_view`,
    sourceMongoCollectionQuery:`{"district":"district_2"}`
  },
  {
    name: "district_2_schedule",
    loginScriptPath: `district_2/login/login.js`,
    loginParamUserName:`DISTRICT_2_USERNAME`,
    loginParamPassword:`DISTRICT_2_PASSWORD`,
    browserScriptPath: `district_2/teams/02_add_missing_schedule.js`,
    startingURL:getConfigurationValueByKey("DISTRICT_2_ENTRY_POINT_URL"),
    scriptReadyURL:getConfigurationValueByKey("DISTRICT_2_SCRIPT_READY_URL"),
    sourceMongoCollection:`salesforce_sessions_not_in_district_view`,
    sourceMongoCollectionQuery:`{"district":"district_2"}`
  },
  {
    name: "district_2_attendances",
    loginScriptPath: `district_2/login/login.js`,
    loginParamUserName:`DISTRICT_2_USERNAME`,
    loginParamPassword:`DISTRICT_2_PASSWORD`,
    browserScriptPath: `district_2/attendance/01_add_missing_attendance.js`,
    startingURL:getConfigurationValueByKey("DISTRICT_2_ENTRY_POINT_URL"),
    scriptReadyURL:getConfigurationValueByKey("DISTRICT_2_SCRIPT_READY_URL"),
    sourceMongoCollection:`salesforce_attendance_to_set_in_district_2`,
    sourceMongoCollectionQuery:`{}`
  },
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
        sourceMongoCollection,
        sourceMongoCollectionQuery
      } = matchingSecondaryCommand[0];
      if (!!browserScriptPath && !!loginScriptPath && !!loginParamUserName && !!loginParamPassword && !!startingURL && !!name && !!scriptReadyURL && !!sourceMongoCollection) {
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
            } catch(e) {
              console.error("LOGIN ERROR");
              console.error(e);
            }
            const results = await waitUntilLocation(browser, scriptReadyURL);
            if (results === true) {
              const scriptContentToRunInBrowser = await getTextFileContent(browserScriptPath);
              if (!!scriptContentToRunInBrowser) {
                const inputFileName = `input_push_${parameters[1]}_${new Date().valueOf()}.json`;
                const inputData = JSON.stringify(await queryDocuments(sourceMongoCollection,!!sourceMongoCollectionQuery ? JSON.parse(sourceMongoCollectionQuery) : {}));
                await fs.writeFileSync(`../${inputFileName}`, inputData, (err) => {
                  if (err)
                    console.log(err);
                  else {
                    console.log(`File written successfully : ${resultsFileName}`);
                  }
                });
                const dataStringToPassToScript = encodeURIComponent(inputData);
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
                browser.executeAsyncScript(combinedScriptWithAsyncWrapper.split(`!REPLACE_DATABASE_DATA`).join(`${dataStringToPassToScript}`), 100).then().catch().then()
                console.log(`push script running`);
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

export default runBrowserScrapeCommands;