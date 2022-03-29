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
const scheduleAddMainPage_HeaderTagType = "td";
const scheduleAddMainPage_HeaderKeyText = "ADD DATE(S) TO SCHEDULE";
const scheduleSingDateMainPage_HeaderKeyText = "ADD DATE TO SCHEDULE";

//WORKER FUNCTIONS
const blWindowFramesExist = () => !!window && !!window.frames && !!window.frames.length > 0 && !!window.frames[0].document;
const getMainIFrameContent = () => window.frames[0].document;
const isOnGrantsPage = () => getPageElementsByTagName(grantsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(grantsPage_HeaderKeyText) > -1).length > 0;
const convertHTMLCollectionToArray = (htmlCollection) => [].slice.call(htmlCollection);
const getPageElementsByTagName = (tagName) => convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));
const getPageElementsByClassName = (className) => {return getMainIFrameContent().getElementsByClassName(className);};
const isOnActivitiesPage = () => getPageElementsByTagName(activitiesPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(activitiesPage_HeaderKeyText) > -1).length > 0;
const isOnScheduleMainForm = () => getPageElementsByTagName(scheduleAddMainPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.indexOf(scheduleAddMainPage_HeaderKeyText) > -1).length > 0;
const isOnSingleDateScheduleMainForm = () => getPageElementsByTagName(scheduleAddMainPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.indexOf(scheduleSingDateMainPage_HeaderKeyText) > -1).length > 0;
const isOnSavedScheduleMainForm = () => getPageElementsByTagName('span').filter(item => !!item.innerHTML && item.innerHTML === 'Date(s) successfully added to schedule.').length > 0;
const isOnYouthParticipantsPage = () => getPageElementsByTagName(youthParticipantsPage_HeaderTagType).filter((item) => {return !!item.innerHTML && item.innerHTML.indexOf(youthParticipantsPage_HeaderKeyText) > -1}).length > 0;
const getGroupActivitiesPageLink = () => getPageElementsByTagName("a").filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(`Group Activities`) > -1);

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

const waitUntilActivityPageAppears = (newTeamSchedule, intIndex) => {
  if (isOnActivitiesPage()) {
    sendLog("continuing to the next schedule entry");
    enterTeamSchedules(newTeamSchedule, parseInt(intIndex) + 1);
  } else {
    sendLog("waiting for details page to appear...");
    setTimeout(() => {
      waitUntilActivityPageAppears(newTeamSchedule, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const waitUntilSavedMessageAppears = (newTeamSchedule, intIndex) => {
  if (isOnSavedScheduleMainForm()) {
    sendLog("Saved!");
    top.DoLinkSubmit('ActionSubmit~PopJump; ');
    waitUntilActivityPageAppears(newTeamSchedule, intIndex);
  } else {
    sendLog("waiting for saved message to appear...");
    setTimeout(() => {
      waitUntilSavedMessageAppears(newTeamSchedule, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const setDropDownValue = (dropDown, newValue) => {
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
  } catch (e) {
    sendError("error with setInputTextBoxValue");
    sendError(dropDown);
    sendError(newValue);
    sendError(e);
  }
  return false;
};

const containsScheduleConfirmSavedMessage = () => {
  const relevantDivs = convertHTMLCollectionToArray(getPageElementsByTagName("div")).filter((item) => !!item.getAttribute("style") && !!item.innerHTML);
  const successDiv = relevantDivs.find((item) => item.getAttribute("style").indexOf("color:") > -1 && item.getAttribute("style").indexOf("green") > -1 && item.innerHTML.indexOf("successfully added to schedule") > -1)
  const overlapDiv = relevantDivs.find((item) => item.getAttribute("style").indexOf("color:") > -1 && item.getAttribute("style").indexOf("red") > -1 && item.innerHTML.indexOf("has overlapping date and times") > -1)
  if (!!successDiv) sendLog("Success Message Found!");
  if (!!overlapDiv) sendLog("Overlapping Dates Message Found!");
  return !!successDiv || !!overlapDiv
}

const waitForConfirmSavedScheduleMessage = (newTeamSchedule, intIndex) => {
  sendLog("waiting for confirmation message...");
  if (containsScheduleConfirmSavedMessage()) {
    sendLog("Continuing to next schedule...");
    const buttons = convertHTMLCollectionToArray(getPageElementsByTagName("input"));
    buttons.map((item) => {
      const currentButtonValue = item.getAttribute("value");
      if (!!currentButtonValue) {
        if (currentButtonValue === "Cancel") {
          sendLog("clicking cancel2...");
          item.click();
          setTimeout(() => {
            enterTeamSchedules(newTeamSchedule, parseInt(intIndex) + 1);
          }, pageTimeoutMilliseconds * 3);
        }
      }
    });
  } else {
    setTimeout(() => {
      sendLog(`still waiting for confirmation message...`);
      waitForConfirmSavedScheduleMessage(newTeamSchedule, intIndex)
    }, pageTimeoutMilliseconds);
  }
}

const waitForSingleDateScheduleForm = (newTeamSchedule, intIndex, intRetryCount) => {
  if (isOnSingleDateScheduleMainForm()) {
    const dateTextSplit = newTeamSchedule[intIndex].sessionDate.split("-");
    const newDateObj = new Date(parseInt(dateTextSplit[0]), parseInt(dateTextSplit[1]) - 1, parseInt(dateTextSplit[2]));
    const newDateDisplayValue = `${newDateObj.getMonth() + 1}/${newDateObj.getDate()}/${newDateObj.getFullYear()}`;
    const dayOfWeek = newDateObj.getDay();
    let startTime = null;
    let endTime = null;
    let blStartTimeSet = false;
    let blEndTimeSet = false;
    let blDateSet = false;
    if (dayOfWeek < 6) {
      startTime = "4:00 PM";
      endTime = "5:00 PM";
    } else {
      startTime = "10:30 AM";
      endTime = "12:15 PM";
    }

    if (!!startTime && !!endTime) {
      const selectElements = convertHTMLCollectionToArray(getPageElementsByTagName("select"));
      if (selectElements.length > 0) {
        selectElements.map((item) => {
          const currentName = item.getAttribute("name");
          if (!!currentName) {
            if (currentName === "BeginTime") {
              blStartTimeSet = setDropDownValue(item, startTime);
            }
            if (currentName === "EndTime") {
              blEndTimeSet = setDropDownValue(item, endTime);
            }
          }

        });
      }
    }
    const inputElements = convertHTMLCollectionToArray(getPageElementsByTagName("input"));
    if (inputElements.length > 0) {
      inputElements.map((item) => {
        const currentName = item.getAttribute("name");
        if (!!currentName) {
          if (currentName.trim() === "SingleDate") {
            item.value = newDateDisplayValue;
            blDateSet = true;
          }
        }
      });
    }
    const buttons = convertHTMLCollectionToArray(getPageElementsByTagName("input"));
    setTimeout(() => {
      if (blStartTimeSet && blEndTimeSet && blDateSet) {
        sendLog("successfully entered values - saving...");
        buttons.map((item) => {
          const currentButtonValue = item.getAttribute("value");
          if (!!currentButtonValue) {
            if (currentButtonValue === "Add Single Date") {
              item.click();
            }
          }
        });
      } else {
        sendError("something wrong with setting new date - cancelling");
        buttons.map((item) => {
          const currentButtonValue = item.getAttribute("value");
          if (!!currentButtonValue) {
            if (currentButtonValue === "Cancel") {
              sendLog("clicking cancel1...");
              item.click();
            }
          }
        });
      }
      waitForConfirmSavedScheduleMessage(newTeamSchedule, intIndex)
    }, pageTimeoutMilliseconds);
  } else {
    setTimeout(() => {
      if (intRetryCount < 3) {
        sendLog(`waiting for main schedule single date form page to load${intRetryCount > 0 ? ` (retry count ${intRetryCount})` : ''}...`);
        waitForSingleDateScheduleForm(newTeamSchedule, intIndex, intRetryCount + 1);
      } else {
        sendLog(`...retry count waitForSingleDateScheduleForm exceeded - running the navigate command again`)
        const buttons = convertHTMLCollectionToArray(getPageElementsByTagName("input"));
        buttons.map((item) => {
          const currentButtonValue = item.getAttribute("value");
          if (!!currentButtonValue) {
            if (currentButtonValue === "Cancel") {
              sendLog("clicking cancel3...");
              item.click();
            }
          }
        });
        setTimeout(() => {
          navigateToActivityTeamSchedule(newTeamSchedule, intIndex)
        },pageTimeoutMilliseconds);
      }
    }, pageTimeoutMilliseconds);
  }
};

const navigateToSingleActivityScheduleAdd = (newTeamSchedule, intIndex) => {
  sendLog("navigating to enter a single date...");
  setTimeout(() => {
    top.DoLinkSubmit(`AutomaticLink~ServiceSchedule_Single.asp?ServiceID=${newTeamSchedule[intIndex].activityID}`);
    waitForSingleDateScheduleForm(newTeamSchedule, intIndex, 0);
  }, pageTimeoutMilliseconds * 2);
};

const waitForScheduleMainForm = (newTeamSchedule, intIndex, intRetryCount) => {
  if (isOnScheduleMainForm()) {
    navigateToSingleActivityScheduleAdd(newTeamSchedule, intIndex)
  } else {
    setTimeout(() => {
      if (intRetryCount < 3) {
        sendLog(`waiting for main schedule form page to load${intRetryCount > 0 ? ` (retry count ${intRetryCount})` : ''}...`);
        waitForScheduleMainForm(newTeamSchedule, intIndex, intRetryCount + 1);
      } else {
        sendLog(`...retry count waitForScheduleMainForm exceeded - running the navigate command again`)
        const buttons = convertHTMLCollectionToArray(getPageElementsByTagName("input"));
        buttons.map((item) => {
          const currentButtonValue = item.getAttribute("value");
          if (!!currentButtonValue) {
            if (currentButtonValue === "Cancel") {
              sendLog("clicking cancel4...");
              item.click();
            }
          }
        });
        setTimeout(() => {
          navigateToActivityTeamSchedule(newTeamSchedule, intIndex)
        },pageTimeoutMilliseconds);
      }
    }, pageTimeoutMilliseconds);
  }
};

const navigateToActivityTeamSchedule = (newTeamSchedule, intIndex) => {
  sendLog(`Adding Team Schedule ${intIndex + 1} of ${newTeamSchedule.length} for Activity ID ${newTeamSchedule[intIndex].activityID}`);
  setTimeout(() => {
    top.DoLinkSubmit(`ActionSubmit~Push ; Jump ServiceSchedule_Add.asp?ServiceID=${newTeamSchedule[intIndex].activityID}; `);
    waitForScheduleMainForm(newTeamSchedule, intIndex, 0);
  },pageTimeoutMilliseconds);
};

const enterTeamSchedules = (newTeamSchedule, intIndex) => {
  if (intIndex < newTeamSchedule.length) {
    if (!!newTeamSchedule[intIndex].activityID) {
      if (!!newTeamSchedule[intIndex].sessionDate) {
        if (!!newTeamSchedule[intIndex]._id) {
          navigateToActivityTeamSchedule(newTeamSchedule, intIndex);
        } else {
          sendError("error: cannot continue since _id is not defined in the object");
        }
      } else {
        sendError("error: cannot continue since date is not defined in the object");
      }
    } else {
      sendError("error: cannot continue since activityID is not defined in the object");
    }
  } else {
    sendLog(`no more team schedules to enter - done with all ${newTeamSchedule.length} new team schedules.`);
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
      enterTeamSchedules(teamAttendanceParsed, 0);
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
    sendLog(`starting add missing schedules...`);
    if (isOnYouthParticipantsPage()) {
      sendLog(`starting add new schedules for ${teamAttendanceParsed.length} dates`);
      enterTeamSchedules(teamAttendanceParsed, 0);
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
  mainPageController();
} catch(e) {
  console.error(e);
  sendError("unknown application error encountered")
  sendError(e)
}