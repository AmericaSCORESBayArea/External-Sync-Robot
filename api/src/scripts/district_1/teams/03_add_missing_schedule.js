//README
//    use the view: "team_service_dates_not_found_with_teamId_found" as input
//    afterwards, need to rerun the script "01_get_existing_teams_and_schedule.js"
// Time estimate: 2.5 hours for 1,155 individual dates

//wait at least this long before check page load status
const pageTimeoutMilliseconds = 1000;

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
const scheduleAddMainPage_HeaderTagType = "h1";
const scheduleAddMainPage_HeaderKeyText = "SCHEDULE";

//WORKER FUNCTIONS
const blWindowFramesExist = () => {return !!window && !!window.frames && !!window.frames.length > 0 && !!window.frames[0].document};
const getMainIFrameContent = () => {return window.frames[0].document;};
const convertHTMLCollectionToArray = (htmlCollection) => {return [].slice.call(htmlCollection);};
const getPageElementsByTagName = (tagName) => {return convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));};
const getPageElementById = (id) => {return getMainIFrameContent().getElementById(id);};
const isOnActivitiesPage = () => {return getPageElementsByTagName(activitiesPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(activitiesPage_HeaderKeyText) === 0).length > 0;};
const isOnScheduleMainForm = () => {return getPageElementsByTagName(scheduleAddMainPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML === scheduleAddMainPage_HeaderKeyText).length > 0;};
const isOnSavedScheduleMainForm = () => {return getPageElementsByTagName('span').filter(item => !!item.innerHTML && item.innerHTML === 'Date(s) successfully added to schedule.').length > 0;};
const isScheduleValidationErrorMainForm = () => {return getPageElementsByTagName('h3').filter(item => !!item.innerHTML && item.innerHTML === 'Validation Errors').length > 0;};
const isOnGrantsPage = () => getPageElementsByTagName(grantsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(grantsPage_HeaderKeyText) > -1).length > 0;
const getActivitiesPageLink = () => getPageElementsByTagName("span").filter(item => !!item.innerHTML && item.innerHTML.trim() === `Activities`);

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
        type:"message"
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

const addError = (message) => {
  console.error(message);
  errorLog.push(message);
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
    if (isScheduleValidationErrorMainForm()) {
      console.error("VALIDATION ERROR FOUND - skipping to next");
      sendLog("Saved!");
      top.DoLinkSubmit('ActionSubmit~PopJump; ');
      waitUntilActivityPageAppears(newTeamSchedule,intIndex);
    } else {
      sendLog("waiting for saved message to appear...");
      setTimeout(() => {
        waitUntilSavedMessageAppears(newTeamSchedule, intIndex);
      }, pageTimeoutMilliseconds);
    }
  }
};

const continueFillingInScheduleDates = (newTeamSchedule,intIndex) => {

  let blDateEntered = false;
  let blStartTimeEntered = false;
  let blEndTimeEntered = false;

  const sessionDateSplit = newTeamSchedule[intIndex].sessionDate.split("-");
  if (sessionDateSplit.length === 3) {
    const newDateObj = new Date(parseInt(sessionDateSplit[0]),parseInt(sessionDateSplit[1]) - 1,parseInt(sessionDateSplit[2]));
    const newDateDisplayValue = `${newDateObj.getMonth() + 1}/${newDateObj.getDate()}/${newDateObj.getFullYear()}`;
    const dayOfWeek = newDateObj.getDay();
    let startTime = null;
    let endTime = null;
    if (dayOfWeek < 6) {
      startTime = "4:00 PM";
      endTime = "5:00 PM";
    } else {
      startTime = "11:00 AM";
      endTime = "1:00 PM";
    }

    const startTimeSplit = startTime.trim().split(" ");
    const endTimeSplit = endTime.trim().split(" ");

    convertHTMLCollectionToArray(getPageElementsByTagName("input")).map((item) => {
      const currentName = item.getAttribute("name");
      if (!!currentName) {
        if (currentName === "Date") {
          item.value = newDateDisplayValue;
          blDateEntered = true;
        }
      }
    });
    convertHTMLCollectionToArray(getPageElementsByTagName("select")).map((item) => {
      const currentName = item.getAttribute("name");
      if (!!currentName) {
        if (currentName.trim() === "BeginTime") {
          item.classList.remove("jcf-hidden");
          if (!!item.children) {
            if (item.children.length > 0) {
              convertHTMLCollectionToArray(item.children).map((item_2) => {
                const currentTimeSplit = item_2.value.trim().split(" ");
                if (currentTimeSplit.length === 2) {
                  if (currentTimeSplit[0] === startTimeSplit[0] && currentTimeSplit[1] === startTimeSplit[1]) {
                    item_2.selected = true;
                    blStartTimeEntered = true;
                  }
                }
              });
            }
          }
        }
        if (currentName.trim() === "EndTime") {
          item.classList.remove("jcf-hidden");
          if (!!item.children) {
            if (item.children.length > 0) {
              convertHTMLCollectionToArray(item.children).map((item_2) => {
                const currentTimeSplit = item_2.value.trim().split(" ");
                if (currentTimeSplit.length === 2) {
                  if (currentTimeSplit[0] === endTimeSplit[0] && currentTimeSplit[1] === endTimeSplit[1]) {
                    item_2.selected = true;
                    blEndTimeEntered = true;
                  }
                }
              });
            }
          }
        }
      }
    });
    if (blDateEntered && blStartTimeEntered && blEndTimeEntered) {
      sendLog("date, start and end times entered - continuing");
      setTimeout(() => {
        top.DoLinkSubmit('ActionSubmit~Save; ');
        waitUntilSavedMessageAppears(newTeamSchedule, intIndex);
      }, pageTimeoutMilliseconds);
    } else {
      if (!blDateEntered) {
        addError("error: date was not entered");
      }
      if (!blStartTimeEntered) {
        addError("error: start time was not entered");
      }
      if (!blEndTimeEntered) {
        addError("error: end time was not entered");
      }
    }
  } else {
    addError("incorrect date split");
    sendLog(newTeamSchedule[intIndex]);
  }
};

const waitForScheduleMainForm = (newTeamSchedule,intIndex) => {
  if (isOnScheduleMainForm()) {
    const singleDateOption = getPageElementById("Occurrences~1");
    if (!!singleDateOption) {
      sendLog("selecting 'Single Date' option box");
      singleDateOption.click();
      sendLog("continuing filling out the form");
      setTimeout(() => {
        continueFillingInScheduleDates(newTeamSchedule, intIndex);
      }, pageTimeoutMilliseconds);
    } else {
      addError("could not find 'Single Date' option box");
    }
  } else {
    setTimeout(() => {
      sendLog("waiting for main schedule form page to load...");
      waitForScheduleMainForm(newTeamSchedule, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const enterTeamSchedules = (newTeamSchedule,intIndex) => {
  if (intIndex < newTeamSchedule.length) {
    if (!!newTeamSchedule[intIndex].activityID) {
      if (!!newTeamSchedule[intIndex].sessionDate) {
        if (!!newTeamSchedule[intIndex]._id) {
          sendLog(`Adding Team Schedule ${intIndex + 1} of ${newTeamSchedule.length}`);
          top.DoLinkSubmit(`ActionSubmit~Push ; Jump ServiceSchedule_Add.asp?ServiceID=${newTeamSchedule[intIndex].activityID}; `);
          waitForScheduleMainForm(newTeamSchedule, intIndex);
        } else {
          addError("error: cannot continue since _id is not defined in the object");
        }
      } else {
        addError("error: cannot continue since sessionDate is not defined in the object");
      }
    } else {
      addError("error: cannot continue since activityID is not defined in the object");
    }
  } else {
    sendLog(`no more team schedules to enter - done with all ${newTeamSchedule.length} new team schedules.`);
    if (errorLog.length > 0) {
      console.error("SOME ERRORS WERE FOUND!");
      console.error(errorLog);
      console.error(JSON.stringify(errorLog));
    }
    window.close()
  }
};

let errorLog = [];

const waitForGroupActivitiesPageToLoad = () => {
  if (isOnActivitiesPage()) {
    enterTeamSchedules(newTeamScheduleParsed,0);
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

const newTeamScheduleFromServer = "!REPLACE_DATABASE_DATA";
const newTeamScheduleParsed = JSON.parse(decodeURIComponent(newTeamScheduleFromServer));

const mainPageController = () => {
  if (blWindowFramesExist()) {
    if (isOnActivitiesPage()) {
      enterTeamSchedules(newTeamScheduleParsed,0);
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