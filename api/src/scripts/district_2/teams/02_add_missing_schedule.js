//wait at least this long before check page load status
const pageTimeoutMilliseconds = 3000;

//initializing callback that will run with out data
let callback_main = null;

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

const addError = (message) => {
  console.error(message);
  errorLog.push(message);
};

const waitUntilActivityPageAppears = (newTeamSchedule, intIndex) => {
  if (isOnActivitiesPage()) {
    console.log("continuing to the next schedule entry");
    enterTeamSchedules(newTeamSchedule, parseInt(intIndex) + 1);
  } else {
    console.log("waiting for details page to appear...");
    setTimeout(() => {
      waitUntilActivityPageAppears(newTeamSchedule, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const waitUntilSavedMessageAppears = (newTeamSchedule, intIndex) => {
  if (isOnSavedScheduleMainForm()) {
    console.log("Saved!");
    top.DoLinkSubmit('ActionSubmit~PopJump; ');
    waitUntilActivityPageAppears(newTeamSchedule, intIndex);
  } else {
    console.log("waiting for saved message to appear...");
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
    addError("error with setInputTextBoxValue");
    addError(dropDown);
    addError(newValue);
    addError(e);
  }
  return false;
};

const waitForSingleDateScheduleForm = (newTeamSchedule, intIndex) => {
  if (isOnSingleDateScheduleMainForm()) {

    const dateTextSplit= newTeamSchedule[intIndex].sessionDate.split("-");

    const newDateObj = new Date(parseInt(dateTextSplit[0]),parseInt(dateTextSplit[1]) - 1,parseInt(dateTextSplit[2]));
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
      startTime = "11:00 AM";
      endTime = "1:00 PM";
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


    if (blStartTimeSet && blEndTimeSet && blDateSet) {
      console.log("successfully entered values - saving...");
      buttons.map((item) => {
        const currentButtonValue = item.getAttribute("value");
        if (!!currentButtonValue) {
          if (currentButtonValue === "Add Single Date") {
            item.click();
          }
        }
      });
    } else {
      addError("something wrong with setting new date - cancelling");
      buttons.map((item) => {
        const currentButtonValue = item.getAttribute("value");
        if (!!currentButtonValue) {
          if (currentButtonValue === "Cancel") {
            console.log("clicking cancel1...");
            item.click();
          }
        }
      });
    }
    setTimeout(() => {
      console.log("CONTINUE TO NEXT!");
      const buttons2 = convertHTMLCollectionToArray(getPageElementsByTagName("input"));
      buttons2.map((item) => {
        const currentButtonValue = item.getAttribute("value");
        if (!!currentButtonValue) {
          if (currentButtonValue === "Cancel") {
            console.log("clicking cancel2...");
            item.click();
            setTimeout(() => {
              enterTeamSchedules(newTeamSchedule, parseInt(intIndex) + 1);
            }, pageTimeoutMilliseconds * 2);
          }
        }
      });
    }, pageTimeoutMilliseconds);
  } else {
    setTimeout(() => {
      console.log("waiting for main schedule single date form page to load...");
      waitForSingleDateScheduleForm(newTeamSchedule, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const waitForScheduleMainForm = (newTeamSchedule, intIndex) => {
  if (isOnScheduleMainForm()) {

    console.log("navigating to enter a single date...");
    top.DoLinkSubmit(`AutomaticLink~ServiceSchedule_Single.asp?ServiceID=${newTeamSchedule[intIndex].activityID}`);
    waitForSingleDateScheduleForm(newTeamSchedule, intIndex);
  } else {
    setTimeout(() => {
      console.log("waiting for main schedule form page to load...");
      waitForScheduleMainForm(newTeamSchedule, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const enterTeamSchedules = (newTeamSchedule, intIndex) => {
  if (intIndex < newTeamSchedule.length) {
    if (!!newTeamSchedule[intIndex].activityID) {
      if (!!newTeamSchedule[intIndex].sessionDate) {
        if (!!newTeamSchedule[intIndex]._id) {
          console.log(`Adding Team Schedule ${intIndex + 1} of ${newTeamSchedule.length}`);
          top.DoLinkSubmit(`ActionSubmit~Push ; Jump ServiceSchedule_Add.asp?ServiceID=${newTeamSchedule[intIndex].activityID}; `);
          waitForScheduleMainForm(newTeamSchedule, intIndex);
        } else {
          addError("error: cannot continue since _id is not defined in the object");
        }
      } else {
        addError("error: cannot continue since date is not defined in the object");
      }
    } else {
      addError("error: cannot continue since activityID is not defined in the object");
    }
  } else {
    console.log(`no more team schedules to enter - done with all ${newTeamSchedule.length} new team schedules.`);
    if (errorLog.length > 0) {
      console.error("SOME ERRORS WERE FOUND!");
      console.error(errorLog);
      console.error(JSON.stringify(errorLog));
    }
    callback_main(errorLog);
  }
};

let errorLog = [];

const waitForMainGroupActivitiesPageToLoad = () => {
  if (isOnActivitiesPage()) {
      enterTeamSchedules(teamAttendanceParsed, 0);
  } else {
    console.log("waiting for main group activities page to load...");
    setTimeout(() => {
      waitForMainGroupActivitiesPageToLoad();
    },pageTimeoutMilliseconds);
  }
};

const waitForMainDistrictPageToLoad = () => {
  console.log("checking if on main district page...");
  const groupActivitiesLinks = getGroupActivitiesPageLink();
  if (groupActivitiesLinks.length > 0) {
    console.log("main district page loaded... clicking on group activities page...");
    groupActivitiesLinks[0].click();
    waitForMainGroupActivitiesPageToLoad();
  } else {
    console.log("not yet on main district page...");
    setTimeout(() => {
      waitForMainDistrictPageToLoad();
    },pageTimeoutMilliseconds);
  }
};

const clickNewestGrantLink = () => {
  const availableGrants = convertHTMLCollectionToArray(getPageElementsByClassName("contract")).filter((item) => !!item.getAttribute("href"));
  const mostRecentGrant = availableGrants[availableGrants.length - 1];
  console.log(`${availableGrants.length} grants found on page : clicking ${mostRecentGrant}`);
  mostRecentGrant.click();
  waitForMainDistrictPageToLoad();
};

const teamAttendanceFromServer = "!REPLACE_DATABASE_DATA";
const teamAttendanceParsed = JSON.parse(decodeURIComponent(teamAttendanceFromServer));

const mainPageController = () => {
  callback_main = arguments[arguments.length - 1];  //setting callback from the passed implicit arguments sourced in selenium executeAsyncScript()
  if (blWindowFramesExist()) {
    console.log(`starting add missing schedules...`);
    if (isOnYouthParticipantsPage()) {
      console.log(`starting add new schedules for ${teamAttendanceParsed.length} dates`);
      enterTeamSchedules(teamAttendanceParsed, 0);
    } else {
      console.log(`not starting on teams page - attempting to navigate via grants page...`);
      if (isOnGrantsPage()) {
        clickNewestGrantLink();
      } else {
        console.log(`waiting for grants page to load...`);
        setTimeout(() => {
          mainPageController();
        }, pageTimeoutMilliseconds);
      }
    }
  } else {
    console.log(`waiting for window frames to load...`);
    setTimeout(() => {
      mainPageController();
    }, pageTimeoutMilliseconds);
  }
};

mainPageController();