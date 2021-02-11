//wait at least this long before check page load status
const pageTimeoutMilliseconds = 3000;

//STRING CONSTANTS
const activitiesPage_HeaderTagType = "td";
const activitiesPage_HeaderKeyText = "ACTIVITIES";
const scheduleAddMainPage_HeaderTagType = "td";
const scheduleAddMainPage_HeaderKeyText = "ADD DATE(S) TO SCHEDULE";
const scheduleSingDateMainPage_HeaderKeyText = "ADD DATE TO SCHEDULE";

//WORKER FUNCTIONS
const blWindowFramesExist = () => {return !!window && !!window.frames && !!window.frames.length > 0 && !!window.frames[0].document};
const getMainIFrameContent = () => {
  return window.frames[0].document;
};
const convertHTMLCollectionToArray = (htmlCollection) => {
  return [].slice.call(htmlCollection);
};
const getPageElementsByTagName = (tagName) => {
  return convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));
};

const isOnActivitiesPage = () => {
  return getPageElementsByTagName(activitiesPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(activitiesPage_HeaderKeyText) > -1).length > 0;
};
const isOnScheduleMainForm = () => {
  return getPageElementsByTagName(scheduleAddMainPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.indexOf(scheduleAddMainPage_HeaderKeyText) > -1).length > 0;
};
const isOnSingleDateScheduleMainForm = () => {
  return getPageElementsByTagName(scheduleAddMainPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.indexOf(scheduleSingDateMainPage_HeaderKeyText) > -1).length > 0;
};
const isOnSavedScheduleMainForm = () => {
  return getPageElementsByTagName('span').filter(item => !!item.innerHTML && item.innerHTML === 'Date(s) successfully added to schedule.').length > 0;
};

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
    const newDateObj = new Date(newTeamSchedule[intIndex].dateFullText);
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
            console.log("setting date...");
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
    top.DoLinkSubmit(`AutomaticLink~ServiceSchedule_Single.asp?ServiceID=${newTeamSchedule[intIndex].activityId}`);
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
    if (!!newTeamSchedule[intIndex].activityId) {
      if (!!newTeamSchedule[intIndex].dateFullText) {
        if (!!newTeamSchedule[intIndex]._id) {
          console.log(`Adding Team Schedule ${intIndex + 1} of ${newTeamSchedule.length}`);
          top.DoLinkSubmit(`ActionSubmit~Push ; Jump ServiceSchedule_Add.asp?ServiceID=${newTeamSchedule[intIndex].activityId}; `);
          waitForScheduleMainForm(newTeamSchedule, intIndex);
        } else {
          addError("error: cannot continue since _id is not defined in the object");
        }
      } else {
        addError("error: cannot continue since date is not defined in the object");
      }
    } else {
      addError("error: cannot continue since activityId is not defined in the object");
    }
  } else {
    console.log(`no more team schedules to enter - done with all ${newTeamSchedule.length} new team schedules.`);
    if (errorLog.length > 0) {
      console.error("SOME ERRORS WERE FOUND!");
      console.error(errorLog);
      console.error(JSON.stringify(errorLog));
    }
  }
};

let errorLog = [];

const mainPageController = (newTeamSchedule) => {
  if (!!newTeamSchedule && newTeamSchedule.length > 0) {
    console.log(`starting new schedule creation for ${newTeamSchedule.length} teams`);
    if (isOnActivitiesPage()) {
      enterTeamSchedules(newTeamSchedule, 0);
    } else {
      console.error(`Not on the correct page. Please navigate to "Activities Page" and run again when the page header is "${activitiesPage_HeaderKeyText}"`);
    }
  } else {
    console.error('no team schedules passed');
  }
};