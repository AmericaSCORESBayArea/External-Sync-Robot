//README
//    sometimes attendance is incorrectly entered, this will iterate through all teams and click "CLEAR ALL" then "SAVE"
//    use the view: "team_details_verify" as input and it will iterate through all the teams and whatever schedule is found
//    afterwards
//        [1] need to manually copy/paste values from the view "attendance_import_data_view"
//        [2] need to rerun the script "01_get_existing_teams_and_schedule.js"

// Time estimate: 1 hour 10 minutes for 37 teams with ~15 weeks each

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
const activitiesPage_HeaderTagType = "h1";
const activitiesPage_HeaderKeyText = "ACTIVITIES";
const activityDetailsPage_HeaderTagType = "h1";
const activityDetailsPage_HeaderKeyText = "ACTIVITY DETAILS";
const attendanceMainPage_HeaderTagType = "h1";
const attendanceMainPage_HeaderKeyText = "ATTENDANCE";
const attendanceMainPage_TeamTagType = "h2";
const enrollmentAddConfirmPage_HeaderTagType = "h4";
const enrollmentAddConfirmPage_HeaderKeyText = "Indicate the begin enrollment date for each participant";
const enrollmentConfirmedPage_HeaderTagType = "h1";
const enrollmentConfirmedPage_HeaderKeyText = "ENROLLMENT CONFIRMED";

//WORKER FUNCTIONS
const blWindowFramesExist = () => {return !!window && !!window.frames && !!window.frames.length > 0 && !!window.frames[0].document};
const getMainIFrameContent = () => {return window.frames[0].document;};
const convertHTMLCollectionToArray = (htmlCollection) => {return [].slice.call(htmlCollection);};
const getPageElementsByTagName = (tagName) => {return convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));};
const isOnActivitiesPage = () => {return getPageElementsByTagName(activitiesPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(activitiesPage_HeaderKeyText) === 0).length > 0;};

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

const isOnTeamAttendanceMainForm = (teamName) => {
  let blReturn = false;
  const blMatchingAttendanceMainHeaderFound = getPageElementsByTagName(attendanceMainPage_HeaderTagType).map(item => !!item.innerHTML && item.innerHTML === attendanceMainPage_HeaderKeyText).length > 0;
  if (blMatchingAttendanceMainHeaderFound) {
    getPageElementsByTagName(attendanceMainPage_TeamTagType).map((item) => {
      if (!!item.innerHTML && item.innerHTML.trim().toLowerCase() === teamName.trim().toLowerCase() ) {
        blReturn=true;
      }
    });
  }
  return blReturn;
};

const isOnTeamParticipantRegistrationConfirmForm = () => {return getPageElementsByTagName(enrollmentAddConfirmPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML === enrollmentAddConfirmPage_HeaderKeyText).length > 0;};
const isOnTeamParticipantRegistrationSaveConfirmedPage = () => {return getPageElementsByTagName(enrollmentConfirmedPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML === enrollmentConfirmedPage_HeaderKeyText).length > 0;};

const isOnAttendanceWeekMainForm = (link) => {
  let blReturn = false;
  const linkWithoutServiceFormat = link.split(`serviceFormatId=&`).join('');
  const linkQuestionMarkSplit = linkWithoutServiceFormat.split(`?`);
  const linkCompare = linkQuestionMarkSplit[linkQuestionMarkSplit.length - 1].trim().toLowerCase();
  if (linkQuestionMarkSplit.length > 0) {
    convertHTMLCollectionToArray(getPageElementsByTagName(`form`)).map((item) => {
      const currentAction = item.getAttribute("action");
      const currentActionQuestionMarkSplit = currentAction.split(`?`);
      const currentActionCompare = currentActionQuestionMarkSplit[currentActionQuestionMarkSplit.length - 1].trim().toLowerCase();
      if (`${linkCompare}`.indexOf(`${currentActionCompare}`) === 0) {
        blReturn = true;
      }
    });
  }
  return blReturn;
};

const isOnSavedScheduleMainForm = () => {return getPageElementsByTagName('span').filter(item => !!item.innerHTML && item.innerHTML === 'Date(s) successfully added to schedule.').length > 0;};

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

const waitForAttendanceWeekMainForm = (newTeamParticipants,intIndex,attendanceWeekDateRangeLinks,intWeekIndex) => {
  if (isOnAttendanceWeekMainForm(attendanceWeekDateRangeLinks[intWeekIndex])) {
    sendLog('setting all to reset...');
    top.DoLinkSubmit('ActionSubmit~AllClear;');
    setTimeout(() => {
      sendLog('saving...');
      top.DoLinkSubmit('ActionSubmit~Save; ');
      setTimeout(() => {
        sendLog('navigating to next attendance week');
        navigateToAttendanceWeekMainForm(newTeamParticipants,intIndex,attendanceWeekDateRangeLinks,parseInt(intWeekIndex) + 1);
      },pageTimeoutMilliseconds);
    },pageTimeoutMilliseconds);
  } else {
    setTimeout(() => {
      sendLog("waiting for team participant attendance week form page to load...");
      waitForAttendanceWeekMainForm(newTeamParticipants,intIndex,attendanceWeekDateRangeLinks,intWeekIndex);
    }, pageTimeoutMilliseconds);
  }
};

const navigateToAttendanceWeekMainForm = (newTeamParticipants,intIndex,attendanceWeekDateRangeLinks,intWeekIndex) => {
  if (intWeekIndex < attendanceWeekDateRangeLinks.length) {
    sendLog(`navigating to week ${intWeekIndex + 1} of ${attendanceWeekDateRangeLinks.length} for team ${intIndex + 1} of ${newTeamParticipants.length}`);
    top.DoLinkSubmit(attendanceWeekDateRangeLinks[intWeekIndex].split(`top.DoLinkSubmit('`).join('').split(`');`).join(''));
    waitForAttendanceWeekMainForm(newTeamParticipants, intIndex, attendanceWeekDateRangeLinks, intWeekIndex)
  } else {
    sendLog("no more attendance weeks for this team - continuing to next team");
    enterTeamAllReset(newTeamParticipants,parseInt(intIndex) + 1);
  }
};

const waitForTeamAttendanceMainForm = (newTeamParticipants,intIndex) => {
  if (isOnTeamAttendanceMainForm(newTeamParticipants[intIndex].details.ActivityName)) {
    let attendanceWeekDateRangeLinks = [];
    convertHTMLCollectionToArray(getPageElementsByTagName("a")).map((item) => {
      const currentOnClick = item.getAttribute("onClick");
      try {
        if (!!currentOnClick) {
          if (currentOnClick.trim().length > 0) {
            if (currentOnClick.trim().indexOf(`AttendanceRecordsWeekly.asp?WeekStart=`) > -1) {
              attendanceWeekDateRangeLinks.push(`${currentOnClick}`.split(`return false;`).join(''));
            }
          }
        }
      } catch(e) {
        sendError("some stray error with waitForTeamAttendanceMainForm!");
        sendError(e);
      }
    });

    if (attendanceWeekDateRangeLinks.length > 0) {
      sendLog(`found - ${attendanceWeekDateRangeLinks.length} attendance weeks - navigating to the first`);
      navigateToAttendanceWeekMainForm(newTeamParticipants,intIndex,attendanceWeekDateRangeLinks,0);
    } else {
      sendLog(`no attendance weeks found - continuing to next team`);
      enterTeamAllReset(newTeamParticipants,parseInt(intIndex) + 1);
    }
  } else {
    setTimeout(() => {
      sendLog("waiting for main team participant attendance form page to load...");
      waitForTeamAttendanceMainForm(newTeamParticipants, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const enterTeamAllReset = (newTeamParticipants,intIndex) => {
  if (intIndex < newTeamParticipants.length) {
    if (!!newTeamParticipants[intIndex].details) {
      if (!!newTeamParticipants[intIndex].details.ActivityID) {
        if (!!newTeamParticipants[intIndex].details.ActivityName) {
          sendLog(`continuing clearing attendance ${intIndex + 1} of ${newTeamParticipants.length} teams`);
          top.DoLinkSubmit(`ActionSubmit~save; ; jump /Web/sms2/Services/ServiceFindByWeek.asp?ServiceID=${newTeamParticipants[intIndex].details.ActivityID};`);
          waitForTeamAttendanceMainForm(newTeamParticipants, intIndex);
        } else {
          sendError("error: cannot continue since details.ActivityName is not defined in the object");
        }
      } else {
        sendError("error: cannot continue since details.ActivityID is not defined in the object");
      }
    } else {
      sendError("error: cannot continue since details is not defined in the object");
    }
  } else {
    sendLog(`no more team participant registrations to enter - done with all ${newTeamParticipants.length} new team participant registrations.`);
    if (errorLog.length > 0) {
      sendError("SOME ERRORS WERE FOUND!");
      sendError(errorLog);
      sendError(JSON.stringify(errorLog));
    }
  }
};

let errorLog = [];

const mainPageController = (newTeamParticipants) => {
  if (!!newTeamParticipants && newTeamParticipants.length > 0) {
    sendLog(`starting setting team all reset for ${newTeamParticipants.length} teams`);
    if (isOnActivitiesPage()) {
      enterTeamAllReset(newTeamParticipants,0);
    } else {
      sendError(`Not on the correct page. Please navigate to "Activities Page" and run again when the page header is "${activitiesPage_HeaderKeyText}"`);
    }
  } else {
    sendError('no team participant registrations passed');
  }
};