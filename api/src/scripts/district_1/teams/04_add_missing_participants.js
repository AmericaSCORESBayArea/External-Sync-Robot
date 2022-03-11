//README
//    use the view: "attendance_team_complete_participant_enrollment_not_found_with_teamId_found_and_participantId_found" as input
//    afterwards, need to rerun the script "01_get_existing_teams_and_schedule.js"
// Time estimate: 10 minutes for 34 teams with 454 participants

const instanceDate = new Date().toISOString();

//wait at least this long before check page load status
const pageTimeoutMilliseconds = 3000;

//command
const command = `!REPLACE_COMMAND`

// callback server
const requestURL = '!REPLACE_API_SERVER'

// target collection
const resultsCollection = '!REPLACE_MONGO_COLLECTION'

//wait at least this long bef
//STRING CONSTANTS
const grantsPage_HeaderTagType = "h1";
const grantsPage_HeaderKeyText = "Agency Programs";
const activitiesPage_HeaderTagType = "h1";
const activitiesPage_HeaderKeyText = "ACTIVITIES";
const activityDetailsPage_HeaderTagType = "h1";
const activityDetailsPage_HeaderKeyText = "ACTIVITY DETAILS";
const enrollmentAddMainPage_HeaderTagType = "h1";
const enrollmentAddMainPage_HeaderKeyText = "ENROLL PARTICIPANT(S)";
const enrollmentAddConfirmPage_HeaderTagType = "h4";
const enrollmentAddConfirmPage_HeaderKeyText = "Indicate the begin enrollment date for each participant";
const enrollmentConfirmedPage_HeaderTagType = "h1";
const enrollmentConfirmedPage_HeaderKeyText = "ENROLLMENT CONFIRMED";

//WORKER FUNCTIONS
const blWindowFramesExist = () => {return !!window && !!window.frames && !!window.frames.length > 0 && !!window.frames[0].document};
const getMainIFrameContent = () => {return window.frames[0].document;};
const convertHTMLCollectionToArray = (htmlCollection) => {return [].slice.call(htmlCollection);};
const getPageElementsByTagName = (tagName) => {return convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));};
const getPageElementById = (id) => {return getMainIFrameContent().getElementById(id);};
const isOnActivitiesPage = () => {return getPageElementsByTagName(activitiesPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(activitiesPage_HeaderKeyText) === 0).length > 0;};
const isOnTeamParticipantRegistrationMainForm = () => {return getPageElementsByTagName(enrollmentAddMainPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML === enrollmentAddMainPage_HeaderKeyText).length > 0;};
const isOnTeamParticipantRegistrationConfirmForm = () => {return getPageElementsByTagName(enrollmentAddConfirmPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML === enrollmentAddConfirmPage_HeaderKeyText).length > 0;};
const isOnTeamParticipantRegistrationSaveConfirmedPage = () => {return getPageElementsByTagName(enrollmentConfirmedPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML === enrollmentConfirmedPage_HeaderKeyText).length > 0;};
const isOnSavedScheduleMainForm = () => {return getPageElementsByTagName('span').filter(item => !!item.innerHTML && item.innerHTML === 'Date(s) successfully added to schedule.').length > 0;};
const isOnGrantsPage = () => getPageElementsByTagName(grantsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(grantsPage_HeaderKeyText) > -1).length > 0;
const getActivitiesPageLink = () => getPageElementsByTagName("span").filter(item => !!item.innerHTML && item.innerHTML.trim() === `Activities`);

const sendError = (errorMessage) => {
  const url = `${requestURL}/browser-log`
  try {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message:errorMessage,
        command,
        instanceDate,
        type:"error"
      })
    }).then((res, err) => {
      if (err) console.error(err)
    }).catch((err) => {
      console.error("error sending result data request---1")
      console.error(err)
    })
  } catch (e) {
    console.error("error sending result data request---2")
    console.error(e)
  }
};

const sendLog = (message) => {
  const url = `${requestURL}/browser-log`
  try {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        command,
        instanceDate,
        type:"message"
      })
    }).then((res, err) => {
      if (err) sendError(err)
    }).catch((err) => {
      sendError("error sending result data request---1")
      sendError(err)
    })
  } catch (e) {
    sendError("error sending result data request---2")
    sendError(e)
  }
};

const addError = (message) => {
  sendError(message);
  errorLog.push(message);
};

const waitUntilActivityPageAppears = (newTeamSchedule,intIndex) => {
  if (isOnActivitiesPage()) {
    sendLog("continuing to the next schedule entry");
    enterTeamParticipants(newTeamSchedule,parseInt(intIndex) + 1);
  } else {
    sendLog("waiting for details page to appear...");
    setTimeout(() => {
      waitUntilActivityPageAppears(newTeamSchedule,intIndex);
    },pageTimeoutMilliseconds);
  }
};

const waitUntilSavedMessageAppears = (newTeamSchedule,intIndex) => {
  if (isOnSavedScheduleMainForm()) {
    sendLog("Saved!");
    top.DoLinkSubmit('ActionSubmit~PopJump; ');
    waitUntilActivityPageAppears(newTeamSchedule,intIndex);
  } else {
    sendLog("waiting for saved message to appear...");
    setTimeout(() => {
      waitUntilSavedMessageAppears(newTeamSchedule,intIndex);
    },pageTimeoutMilliseconds);
  }
};

const waitForConfirmSavedRegistrationForm = (newTeamParticipants,intIndex) => {
  if (isOnTeamParticipantRegistrationSaveConfirmedPage()) {
    sendLog(`team registration confirmed for ${newTeamParticipants[intIndex].teamId}`);
    top.DoLinkSubmit('ActionSubmit~PopJump; ');
    setTimeout(() => {
      sendLog("continuing to next registration");
      enterTeamParticipants(newTeamParticipants,parseInt(intIndex) + 1);
    }, pageTimeoutMilliseconds);
  } else {
    setTimeout(() => {
      sendLog("waiting for team participant registration confirmed saved form page to load...");
      waitForConfirmSavedRegistrationForm(newTeamParticipants, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const waitForConfirmRegistrationForm = (newTeamParticipants,intIndex) => {
  if (isOnTeamParticipantRegistrationConfirmForm()) {
    sendLog(`confirming selection for ${newTeamParticipants[intIndex].teamId}`);
    top.DoLinkSubmit('ActionSubmit~Next2;');
    waitForConfirmSavedRegistrationForm(newTeamParticipants,intIndex);
  } else {
    setTimeout(() => {
      sendLog("waiting for team participant registration confirm form page to load...");
      waitForConfirmRegistrationForm(newTeamParticipants, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const waitForTeamParticipantRegistrationMainForm = (newTeamParticipants,intIndex) => {
  if (isOnTeamParticipantRegistrationMainForm()) {
    let selectedParticipants = [];
    convertHTMLCollectionToArray(getPageElementsByTagName("input")).map((item) => {
      const currentName = item.getAttribute("name");
      try {
        if (!!currentName) {
          if (currentName.trim().length > 0) {
            if (currentName.trim() === "personid") {
              const currentValue = item.getAttribute("value");
              if (!!currentValue) {
                if (currentValue.trim().length > 0) {
                  if (newTeamParticipants[intIndex].registered_participants.map((item) => item.participantId).indexOf(currentValue.trim()) > -1) {
                    item.checked = true;
                    sendLog(`selected participant id ${currentValue.trim()}`);
                    selectedParticipants.push(currentValue.trim());
                  }
                }
              }
            }
          }
        }
      } catch(e) {
        sendError("some stray error!");
        sendError(e);
      }
    });
    newTeamParticipants[intIndex].registered_participants.map((item) => {
      if (selectedParticipants.indexOf(item.participantId) === -1) {
        addError(`the participant was not selected for some reason - please check (${JSON.stringify(item)})`);
      }
    });
    if (selectedParticipants.length > 0) {
      sendLog(`${selectedParticipants.length} participants selected - continuing`);
      top.DoLinkSubmit('ActionSubmit~Next1; ');
      waitForConfirmRegistrationForm(newTeamParticipants,intIndex);
    } else {
      addError(`no participants selected for teamId ${newTeamParticipants[intIndex].teamId} - continuing to next team`);
      enterTeamParticipants(newTeamParticipants,parseInt(intIndex) + 1);
    }
  } else {
    setTimeout(() => {
      sendLog("waiting for main team participant registration form page to load...");
      waitForTeamParticipantRegistrationMainForm(newTeamParticipants, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const enterTeamParticipants = (newTeamParticipants,intIndex) => {
  if (intIndex < newTeamParticipants.length) {
    if (!!newTeamParticipants[intIndex].teamId) {
      if (!!newTeamParticipants[intIndex].registered_participants) {
        if (!!newTeamParticipants[intIndex].registered_participants.length > 0) {
          sendLog(`continuing registration ${intIndex + 1} of ${newTeamParticipants.length} participants for team ${newTeamParticipants[intIndex].teamId}`);
          setTimeout(() => {
            top.DoLinkSubmit(`ActionSubmit~Push ; Jump EnrollWizard.asp?ServiceID=${newTeamParticipants[intIndex].teamId};`);
            waitForTeamParticipantRegistrationMainForm(newTeamParticipants, intIndex);
          }, pageTimeoutMilliseconds)
        } else {
          addError("error: cannot continue since there are no registered_participants found in the object");
        }
      } else {
        addError("error: cannot continue since registered_participants is not defined in the object");
      }
    } else {
      addError("error: cannot continue since activityId is not defined in the object");
    }
  } else {
    sendLog(`no more team participant registrations to enter - done with all ${newTeamParticipants.length} new team participant registrations.`);
    if (errorLog.length > 0) {
      sendError("SOME ERRORS WERE FOUND!");
      sendError(errorLog);
      sendError(JSON.stringify(errorLog));
    }
    window.close()
  }
};

let errorLog = [];

const waitForGroupActivitiesPageToLoad = () => {
  if (isOnActivitiesPage()) {
    enterTeamParticipants(newTeamParticipantsParsed,0);
  } else {
    sendLog("waiting for group activities page to load...");
    setTimeout(() => {
      waitForGroupActivitiesPageToLoad();
    },pageTimeoutMilliseconds);
  }
};

const waitForMainDistrictPageToLoad = () => {
  sendLog("checking if on main district page...");
  const groupActivitiesLinks = getActivitiesPageLink();
  if (groupActivitiesLinks.length > 0) {
    sendLog("main district page loaded... clicking on group activities page...");
    groupActivitiesLinks[0].click();
    setTimeout(() => {
      waitForGroupActivitiesPageToLoad();
    },pageTimeoutMilliseconds);
  } else {
    sendLog("not yet on main district page...");
    setTimeout(() => {
      waitForMainDistrictPageToLoad();
    },pageTimeoutMilliseconds);
  }
};

const clickNewestGrantLink = () => {
  const availableGrants = convertHTMLCollectionToArray(getPageElementsByTagName("a")).filter((item) => item.innerHTML.trim().indexOf(`America SCORES Soccer Program`) > -1);
  const mostRecentGrant = availableGrants[availableGrants.length - 1];
  sendLog(`${availableGrants.length} grants found on page : clicking ${mostRecentGrant}`);
  mostRecentGrant.click();
  waitForMainDistrictPageToLoad();
};

const newTeamParticipantsFromServer = "!REPLACE_DATABASE_DATA";
const newTeamParticipantsParsed = JSON.parse(decodeURIComponent(newTeamParticipantsFromServer));

const mainPageController = () => {
  if (blWindowFramesExist()) {
    if (isOnActivitiesPage()) {
      enterTeamParticipants(newTeamParticipantsParsed,0);
    } else {
      sendLog(`not starting on activities page - attempting to navigate via grants page...`);
      if (isOnGrantsPage()) {
        clickNewestGrantLink();
      } else {
        sendLog(`waiting for grants page to load...`);
        setTimeout(() => {
          mainPageController();
        }, pageTimeoutMilliseconds);
      }
    }
  } else {
    sendLog(`waiting for window frames to load...`);
    setTimeout(() => {
      mainPageController();
    }, pageTimeoutMilliseconds);
  }
};

mainPageController();