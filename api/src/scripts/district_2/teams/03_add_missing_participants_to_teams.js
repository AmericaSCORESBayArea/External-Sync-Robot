const instanceDate = new Date().toISOString();

//wait at least this long before check page load status
const pageTimeoutMilliseconds = 3000;

//command
const command = `!REPLACE_COMMAND`

// callback server
const requestURL = '!REPLACE_API_SERVER'

// target collection
const resultsCollection = '!REPLACE_MONGO_COLLECTION'

//STRING CONSTANTS
const grantsPage_HeaderTagType = "span";
const grantsPage_HeaderKeyText = "GRANT LIST";
const youthParticipantsPage_HeaderTagType = "td";
const youthParticipantsPage_HeaderKeyText = "PARTICIPANTS &amp; STAFF";
const activitiesPage_HeaderTagType = "td";
const activitiesPage_HeaderKeyText = "ACTIVITIES";
const enrollmentAddMainPage_HeaderTagType = "td";
const enrollmentAddMainPage_HeaderKeyText = "ENROLL PARTICIPANT";
const enrollmentAddSearchPage_HeaderTagType = "td";
const enrollmentAddSearchPage_HeaderKeyText = "STEP 2: SELECT PARTICIPANTS";
const enrollmentAddConfirmPage_HeaderTagType = "td";
const enrollmentAddConfirmPage_HeaderKeyText = "STEP 3: SELECT ENROLL DATE(S)";
const enrollmentConfirmedPage_HeaderTagType = "td";
const enrollmentConfirmedPage_HeaderKeyText = "ENROLLMENT CONFIRMED";

//WORKER FUNCTIONS
const blWindowFramesExist = () => {return !!window && !!window.frames && !!window.frames.length > 0 && !!window.frames[0].document};
const getMainIFrameContent = () => {return window.frames[0].document;};
const convertHTMLCollectionToArray = (htmlCollection) => {return [].slice.call(htmlCollection);};
const isOnGrantsPage = () => getPageElementsByTagName(grantsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(grantsPage_HeaderKeyText) > -1).length > 0;
const getPageElementsByTagName = (tagName) => {return convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));};
const getPageElementByName = (name) => {return getMainIFrameContent().getElementsByName(name);};
const getPageElementsByClassName = (className) => {return getMainIFrameContent().getElementsByClassName(className);};
const isOnActivitiesPage = () => {return getPageElementsByTagName(activitiesPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(activitiesPage_HeaderKeyText) > -1).length > 0;};
const isOnTeamParticipantEnrollmentMainForm = () => {return getPageElementsByTagName(enrollmentAddMainPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.indexOf(enrollmentAddMainPage_HeaderKeyText) > -1).length > 0;};
const isOnTeamParticipantEnrollmentSearchResultsForm = () => {return getPageElementsByTagName(enrollmentAddSearchPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.indexOf(enrollmentAddSearchPage_HeaderKeyText) > -1).length > 0;};
const isOnTeamParticipantEnrollmentConfirmForm = () => {return getPageElementsByTagName(enrollmentAddConfirmPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.indexOf(enrollmentAddConfirmPage_HeaderKeyText) > -1).length > 0;};
const isOnTeamParticipantEnrollmentSaveConfirmedPage = () => {return getPageElementsByTagName(enrollmentConfirmedPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.indexOf(enrollmentConfirmedPage_HeaderKeyText) > -1).length > 0;};
const getGroupActivitiesPageLink = () => getPageElementsByTagName("a").filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(`Group Activities`) > -1);

const isOnYouthParticipantsPage = () => getPageElementsByTagName(youthParticipantsPage_HeaderTagType).filter((item) => {return !!item.innerHTML && item.innerHTML.indexOf(youthParticipantsPage_HeaderKeyText) > -1}).length > 0;

const isOnSavedScheduleMainForm = () => {return getPageElementsByTagName('span').filter(item => !!item.innerHTML && item.innerHTML === 'Date(s) successfully added to schedule.').length > 0;};

const containsScheduleConflicts = () => getPageElementsByTagName('td').filter(item => !!item.innerHTML && item.innerHTML === ' SCHEDULE CONFLICTS').length > 0

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

const setDropDownValue = (dropDown,newValue) => {
  try {
    dropDown.value = newValue;
    if (!!dropDown.children) {
      convertHTMLCollectionToArray(dropDown.children).map((item) => {
        if (!!item.innerHTML) {
          if (`${item.innerHTML}` === newValue) {
            item.selected = "selected";
          }
        }
      });
    }
    const intUpdatedDropDownValueCount = `${dropDown.value}`.trim().length;
    if (intUpdatedDropDownValueCount > 0) {
      return true;
    }
  } catch(e) {
    sendError("error with setInputTextBoxValue");
    sendError(dropDown);
    sendError(newValue);
    sendError(e);
  }
  return false;
};

const waitForConfirmSavedEnrollmentForm = (newTeamParticipants,intIndex) => {
  if (isOnTeamParticipantEnrollmentSaveConfirmedPage()) {
    sendLog(`team enrollment confirmed for ${newTeamParticipants[intIndex].teamId}`);
    top.DoLinkSubmit('ActionSubmit~PopJump; ');
    setTimeout(() => {
      sendLog("continuing to next enrollment");
      enterTeamParticipants(newTeamParticipants,parseInt(intIndex) + 1);
    }, pageTimeoutMilliseconds);
  } else {
    if (containsScheduleConflicts()) {
      sendLog("schedule conflicts were found... selecting all and continuing");
      setTimeout(() => {
        const selectAllElement = getPageElementsByTagName('a').find((item) => !!item.innerHTML && item.innerHTML.trim() === "All")
        if (selectAllElement) {
          sendLog("clicking 'All' link to select all...");
          selectAllElement.click();
        } else {
          sendError("no 'All' button was found");
        }
        setTimeout(() => {
          sendLog("clicking continue to 'Next Step' button...");
          top.DoLinkSubmit('ActionSubmit~next3')
          setTimeout(() => {
            sendLog("waiting for team participant enrollment with override enrollments confirmed saved form page to load...");
            waitForConfirmSavedEnrollmentForm(newTeamParticipants, intIndex);
          }, pageTimeoutMilliseconds);
        })
      })
    } else {
      setTimeout(() => {
        sendLog("waiting for team participant enrollment confirmed saved form page to load...");
        waitForConfirmSavedEnrollmentForm(newTeamParticipants, intIndex);
      }, pageTimeoutMilliseconds);
    }
  }
};

const waitForConfirmEnrollmentForm = (newTeamParticipants,intIndex) => {
  if (isOnTeamParticipantEnrollmentConfirmForm()) {
    sendLog(`confirming selection for ${newTeamParticipants[intIndex].teamId}`);
    top.DoLinkSubmit('ActionSubmit~Next2;');
    waitForConfirmSavedEnrollmentForm(newTeamParticipants,intIndex);
  } else {
    setTimeout(() => {
      sendLog("waiting for team participant enrollment confirm form page to load...");
      waitForConfirmEnrollmentForm(newTeamParticipants, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const waitForSelectParticipantsOnTeamEnrollmentForm = (newTeamParticipants,intIndex) => {
  if(isOnTeamParticipantEnrollmentSearchResultsForm()) {
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
        sendError(`the participant was not selected for some reason - please check (${JSON.stringify(item)})`);
      }
    });
    if (selectedParticipants.length > 0) {
      sendLog(`${selectedParticipants.length} participants selected - continuing to next`);
      top.DoLinkSubmit('ActionSubmit~Next1; ');
      waitForConfirmEnrollmentForm(newTeamParticipants,intIndex);
    } else {
      sendError(`no participants selected for teamId ${newTeamParticipants[intIndex].teamId} - continuing to next team`);
      enterTeamParticipants(newTeamParticipants,parseInt(intIndex) + 1);
    }
  } else {
    setTimeout(() => {
      sendLog("waiting for team enrollment search results form to load...");
      waitForSelectParticipantsOnTeamEnrollmentForm(newTeamParticipants, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const waitForTeamParticipantEnrollmentMainForm = (newTeamParticipants,intIndex) => {
  if (isOnTeamParticipantEnrollmentMainForm()) {
    const searchDropDowns = getPageElementByName("persontypeid");
    if (searchDropDowns.length === 1) {
      sendLog("search for youth participants");
      setDropDownValue(searchDropDowns[0],"Youth Participants");
      top.DoLinkSubmit('ActionSubmit~find');
      waitForSelectParticipantsOnTeamEnrollmentForm(newTeamParticipants,intIndex);
    }
  } else {
    setTimeout(() => {
      sendLog("waiting for main team participant search form page to load...");
      waitForTeamParticipantEnrollmentMainForm(newTeamParticipants, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const enterTeamParticipants = (newTeamParticipants,intIndex) => {
  if (intIndex < newTeamParticipants.length) {
    if (!!newTeamParticipants[intIndex].teamId) {
      if (!!newTeamParticipants[intIndex].registered_participants) {
        if (!!newTeamParticipants[intIndex].registered_participants.length > 0) {
          sendLog(`continuing enrollment of ${newTeamParticipants.length} teams for team ${newTeamParticipants[intIndex].teamId}`);
          top.DoLinkSubmit(`ActionSubmit~Push ; Jump EnrollWizard.asp?ServiceID=${newTeamParticipants[intIndex].teamId}&stepnumber=0&ServiceFormatId=10&PersonTypeID=1;`);
          waitForTeamParticipantEnrollmentMainForm(newTeamParticipants, intIndex);
        } else {
          sendError("error: cannot continue since there are no registered_participants found in the object");
        }
      } else {
        sendError("error: cannot continue since registered_participants is not defined in the object");
      }
    } else {
      sendError("error: cannot continue since activityId is not defined in the object");
    }
  } else {
    sendLog(`no more team participant enrollments to enter - done with all ${newTeamParticipants.length} new team participant enrollments.`);
    if (errorLog.length > 0) {
      sendError("SOME ERRORS WERE FOUND!");
      sendError(errorLog);
      sendError(JSON.stringify(errorLog));
    }
    window.close()
  }
};

let errorLog = [];

const waitForMainGroupActivitiesPageToLoad = () => {
  if (isOnActivitiesPage()) {
    enterTeamParticipants(teamAttendanceParsed, 0);
  } else {
    sendLog("waiting for main group activities page to load...");
    setTimeout(() => {
      waitForMainGroupActivitiesPageToLoad();
    },pageTimeoutMilliseconds);
  }
};

const waitForMainDistrictPageToLoad = () => {
  sendLog("checking if on main district page...");
  const groupActivitiesLinks = getGroupActivitiesPageLink();
  if (groupActivitiesLinks.length > 0) {
    sendLog("main district page loaded... clicking on group activities page...");
    groupActivitiesLinks[0].click();
    waitForMainGroupActivitiesPageToLoad();
  } else {
    sendLog("not yet on main district page...");
    setTimeout(() => {
      waitForMainDistrictPageToLoad();
    },pageTimeoutMilliseconds);
  }
};

const clickNewestGrantLink = () => {
  const availableGrants = convertHTMLCollectionToArray(getPageElementsByClassName("contract")).filter((item) => !!item.getAttribute("href"));
  const mostRecentGrant = availableGrants[availableGrants.length - 1];
  sendLog(`${availableGrants.length} grants found on page : clicking ${mostRecentGrant}`);
  mostRecentGrant.click();
  waitForMainDistrictPageToLoad();
};

const teamAttendanceFromServer = "!REPLACE_DATABASE_DATA";
const teamAttendanceParsed = JSON.parse(decodeURIComponent(teamAttendanceFromServer));

const mainPageController = () => {
  if (blWindowFramesExist()) {
    sendLog(`starting add missing enrollments...`);
    if (isOnYouthParticipantsPage()) {
      sendLog(`starting add new participants to teams for ${teamAttendanceParsed.length} dates`);
      enterTeamParticipants(teamAttendanceParsed, 0);
    } else {
      sendLog(`not starting on teams page - attempting to navigate via grants page...`);
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

try {
  mainPageController()
} catch(e) {
  console.error("unknown error encountered")
  console.error(e)
  sendError(e)
}
