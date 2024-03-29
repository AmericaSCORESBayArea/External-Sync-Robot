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
const grantsPage_HeaderTagType = "span";
const grantsPage_HeaderKeyText = "GRANT LIST";
const youthParticipantsPage_HeaderTagType = "td";
const youthParticipantsPage_HeaderKeyText = "PARTICIPANTS &amp; STAFF";
const activitiesPage_HeaderTagType = "td";
const activitiesPage_HeaderKeyText = "ACTIVITIES";
const attendancePage_HeaderTagType = "td";
const attendancePage_HeaderKeyText = "ATTENDANCE";
const scheduleAddMainPage_HeaderTagType = "td";
const scheduleSingDateMainPage_HeaderKeyText = "ADD DATE TO SCHEDULE";

//WORKER FUNCTIONS
const blWindowFramesExist = () => {return !!window && !!window.frames && !!window.frames.length > 0 && !!window.frames[0].document};
const getMainIFrameContent = () => {return window.frames[0].document;};
const isOnGrantsPage = () => getPageElementsByTagName(grantsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(grantsPage_HeaderKeyText) > -1).length > 0;
const convertHTMLCollectionToArray = (htmlCollection) => {return [].slice.call(htmlCollection);};
const getPageElementsByTagName = (tagName) => {return convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));};
const getPageElementsByClassName = (className) => {return getMainIFrameContent().getElementsByClassName(className);};
const isOnAttendancePage = () => {return getPageElementsByTagName(attendancePage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(attendancePage_HeaderKeyText) > -1).length > 0;};
const isOnYouthParticipantsPage = () => getPageElementsByTagName(youthParticipantsPage_HeaderTagType).filter((item) => {return !!item.innerHTML && item.innerHTML.indexOf(youthParticipantsPage_HeaderKeyText) > -1}).length > 0;
const getGroupActivitiesPageLink = () => getPageElementsByTagName("a").filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(`Group Activities`) > -1);

const isOnActivitiesPage = () => {return getPageElementsByTagName(activitiesPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(activitiesPage_HeaderKeyText) > -1).length > 0;};
const isOnSingleDateScheduleMainForm = () => {return getPageElementsByTagName(scheduleAddMainPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.indexOf(scheduleSingDateMainPage_HeaderKeyText) > -1).length > 0;};
const isOnSavedScheduleMainForm = () => {return getPageElementsByTagName('span').filter(item => !!item.innerHTML && item.innerHTML === 'Date(s) successfully added to schedule.').length > 0;};

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
    enterTeamSchedules(newTeamSchedule,parseInt(intIndex) + 1);
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

const waitForActivitiesPageBeforeNextTeam = (newServiceDateAttendance, intIndex, intRetryCount) => {
  if (isOnActivitiesPage()) {
    sendLog("navigating to service date...");
    enterServiceDateAttendance(newServiceDateAttendance, parseInt(intIndex) + 1);
  } else {
    setTimeout(() => {
      if (intRetryCount < 3) {
        sendLog("waiting for activities page to load before continuing to next service date id...");
        waitForActivitiesPageBeforeNextTeam(newServiceDateAttendance, intIndex, intRetryCount + 1);
      } else {
        sendLog(`...retry count waitForActivitiesPageBeforeNextTeam exceeded - running the navigate back command again`)
        const buttons = convertHTMLCollectionToArray(getPageElementsByTagName("input"));
        buttons.map((item) => {
          const currentButtonValue = item.getAttribute("value");
          if (!!currentButtonValue) {
            if (currentButtonValue === "Cancel") {
              sendLog("clicking cancel...");
              item.click();
            }
          }
        });
        setTimeout(() => {
          navigateBack(newServiceDateAttendance, intIndex)
        }, pageTimeoutMilliseconds);
      }
    },pageTimeoutMilliseconds);
  }
};

const navigateBack = (newServiceDateAttendance, intIndex) => {
  setTimeout(() => {
    sendLog("navigating back...");
    top.DoLinkSubmit('ActionSubmit~save; popjump');
    waitForActivitiesPageBeforeNextTeam(newServiceDateAttendance, intIndex, 0);
  }, pageTimeoutMilliseconds * 2);
};

const waitForServiceDateAttendanceMainForm = (newServiceDateAttendance,intIndex, intRetryCount) => {
  if (isOnAttendancePage()) {
    let arrayOfFoundOnPage = [];
    let arrayOfLogs = [];
    convertHTMLCollectionToArray(getPageElementsByTagName("tr")).map((item) => {
      if (!!item.children) {
        if (item.children.length === 5) {
          if (!!item.children[0].innerHTML) {
            if (item.children[0].innerHTML.indexOf(`Participant&nbsp;Name`) === -1) {
              const participantNameToLookFor = `${decodeURIComponent(item.children[0].innerHTML)}`.trim();
              const matchingParticipant = newServiceDateAttendance[intIndex].attendanceData.filter((item_2) => {
                if (!!item_2.name) {
                  if (participantNameToLookFor.trim() === item_2.name.trim()) {
                    return true;
                  }
                }
                return false;
              });
              if (matchingParticipant.length === 1) {
                arrayOfFoundOnPage.push(participantNameToLookFor);
                if (!!matchingParticipant[0].attended) {
                  if (matchingParticipant[0].attended === "true" || matchingParticipant[0].attended === "false") {
                    let inputBoxToSet = null;
                    if (matchingParticipant[0].attended === "true") {
                      if (item.children[1].children) {
                        if (item.children[1].children.length > 0) {
                          inputBoxToSet = item.children[1].children[0];
                        }
                      }
                    }
                    if (matchingParticipant[0].attended === "false") {
                      if (item.children[2].children) {
                        if (item.children[2].children.length > 0) {
                          inputBoxToSet = item.children[2].children[0];
                        }
                      }
                    }
                    inputBoxToSet.checked = true;
                  } else {
                    arrayOfLogs.push(`cannot set attendance for ServiceDateID (${newServiceDateAttendance[intIndex].serviceDateId}) for (${participantNameToLookFor}) since "attended" value is (${matchingParticipant[0].attended}) and only (true) or (false) are allowed`);
                  }
                } else {
                  arrayOfLogs.push(`cannot set attendance for ServiceDateID (${newServiceDateAttendance[intIndex].serviceDateId}) for (${participantNameToLookFor}) since no "attended" value is found in passed data`);
                }

              } else {
                if (matchingParticipant.length === 0) {
                  arrayOfLogs.push(`NO matching participant data passed for ServiceDateID (${newServiceDateAttendance[intIndex].serviceDateId}) for (${participantNameToLookFor}) - (aka, found on page but not in data)`);
                } else {
                  arrayOfLogs.push(`MORE THAN one matching participant found for ServiceDateID (${newServiceDateAttendance[intIndex].serviceDateId}) for (${participantNameToLookFor})`);
                }
              }
            }
          }
        }
      }
    });
    if (arrayOfFoundOnPage.length === newServiceDateAttendance[intIndex].attendanceData.length) {
      arrayOfLogs.push(`all expected ${newServiceDateAttendance[intIndex].attendanceData.length} participants found on page`);
    } else {
      newServiceDateAttendance[intIndex].attendanceData.map((item) => {
        if (arrayOfFoundOnPage.indexOf(item.name) === -1) {
          arrayOfLogs.push(`expected participant (${item.name}) not found on ServiceDateID (${newServiceDateAttendance[intIndex].serviceDateId}) page!`);
        }
      });
    }
    arrayOfLogs.push("saving");
    sendLog(encodeURIComponent(JSON.stringify(arrayOfLogs)));
    top.DoLinkSubmit('ActionSubmit~save; Set ListerPage 1; set Character %%');
    setTimeout(() => {
      navigateBack(newServiceDateAttendance, intIndex)
    },pageTimeoutMilliseconds*2);
  } else {
    setTimeout(() => {
      if (intRetryCount < 3) {
        sendLog("waiting for service date main attendance form page to load...");
        waitForServiceDateAttendanceMainForm(newServiceDateAttendance, intIndex, intRetryCount + 1);
      } else {
        sendLog(`...retry count waitForServiceDateAttendanceMainForm exceeded - running the navigate command again`)
        const buttons = convertHTMLCollectionToArray(getPageElementsByTagName("input"));
        buttons.map((item) => {
          const currentButtonValue = item.getAttribute("value");
          if (!!currentButtonValue) {
            if (currentButtonValue === "Cancel") {
              sendLog("clicking cancel...");
              item.click();
            }
          }
        });
        setTimeout(() => {
          navigateToServiceDateIDPage(newServiceDateAttendance, intIndex)
        }, pageTimeoutMilliseconds);
      }
    }, pageTimeoutMilliseconds);
  }
};

const navigateToServiceDateIDPage = (newServiceDateAttendance,intIndex) => {
  setTimeout(() => {
    sendLog(`Adding Service Date Schedule ${intIndex + 1} of ${newServiceDateAttendance.length}`);
    top.DoLinkSubmit(`ActionSubmit~push; jump AttendanceByService.asp?ServiceDateID=${newServiceDateAttendance[intIndex].serviceDateId}`);
    waitForServiceDateAttendanceMainForm(newServiceDateAttendance, intIndex, 0);
  },pageTimeoutMilliseconds);
};

const enterServiceDateAttendance = (newServiceDateAttendance,intIndex) => {
  if (intIndex < newServiceDateAttendance.length) {
    if (!!newServiceDateAttendance[intIndex].serviceDateId) {
      if (!!newServiceDateAttendance[intIndex].attendanceData) {
        navigateToServiceDateIDPage(newServiceDateAttendance,intIndex)
      } else {
        sendError("error: cannot continue since attendanceData is not defined in the object");
      }
    } else {
      sendError("error: cannot continue since serviceDateId is not defined in the object");
    }
  } else {
    sendLog(`no more team schedules to enter - done with all ${newServiceDateAttendance.length} service date attendances.`);
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
    enterServiceDateAttendance(teamAttendanceParsed, 0);
  } else {
    sendLog("waiting for main group activities page to load...");
    setTimeout(() => {
      waitForMainGroupActivitiesPageToLoad();
    },pageTimeoutMilliseconds);
  }
};

const waitForMainDistrictPageToLoad = () => {
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
    if (isOnYouthParticipantsPage()) {
      sendLog(`starting add attendance ${teamAttendanceParsed.length} dates...`);
      enterServiceDateAttendance(teamAttendanceParsed, 0);
    } else {
      sendLog(`not starting on teams page - attempting to navigate via grants page...`);
      if (isOnGrantsPage()) {
        clickNewestGrantLink();
      } else {
        setTimeout(() => {
          sendLog(`waiting for grants page to load...`);
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