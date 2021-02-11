//README
//    use the view: "team_service_dates_not_found_with_teamId_found" as input
//    afterwards, need to rerun the script "01_get_existing_teams_and_schedule.js"
// Time estimate: 2.5 hours for 1,155 individual dates

//wait at least this long before check page load status
const pageTimeoutMilliseconds = 1000;

//STRING CONSTANTS
const activitiesPage_HeaderTagType = "h1";
const activitiesPage_HeaderKeyText = "ACTIVITIES";
const activityDetailsPage_HeaderTagType = "h1";
const activityDetailsPage_HeaderKeyText = "ACTIVITY DETAILS";
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

const addError = (message) => {
  console.error(message);
  errorLog.push(message);
};

const waitUntilActivityPageAppears = (newTeamSchedule,intIndex) => {
  if (isOnActivitiesPage()) {
    console.log("continuing to the next schedule entry");
    enterTeamSchedules(newTeamSchedule,parseInt(intIndex) + 1);
  } else {
    console.log("waiting for details page to appear...");
    setTimeout(() => {
      waitUntilActivityPageAppears(newTeamSchedule,intIndex);
    },pageTimeoutMilliseconds);
  }
};

const waitUntilSavedMessageAppears = (newTeamSchedule,intIndex) => {
  if (isOnSavedScheduleMainForm()) {
    console.log("Saved!");
    top.DoLinkSubmit('ActionSubmit~PopJump; ');
    waitUntilActivityPageAppears(newTeamSchedule,intIndex);
  } else {
    console.log("waiting for saved message to appear...");
    setTimeout(() => {
      waitUntilSavedMessageAppears(newTeamSchedule,intIndex);
    },pageTimeoutMilliseconds);
  }
};

const continueFillingInScheduleDates = (newTeamSchedule,intIndex) => {

  let blDateEntered = false;
  let blStartTimeEntered = false;
  let blEndTimeEntered = false;

  const dateFullTextSplit = newTeamSchedule[intIndex].dateFullText.split("-");

  if (dateFullTextSplit.length === 3) {
    const newDateObj = new Date(parseInt(dateFullTextSplit[2]),parseInt(dateFullTextSplit[0]) - 1,parseInt(dateFullTextSplit[1]));
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
      console.log("date, start and end times entered - continuing");
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
    console.log(newTeamSchedule[intIndex]);
  }
};

const waitForScheduleMainForm = (newTeamSchedule,intIndex) => {
  if (isOnScheduleMainForm()) {
    const singleDateOption = getPageElementById("Occurrences~1");
    if (!!singleDateOption) {
      console.log("selecting 'Single Date' option box");
      singleDateOption.click();
      console.log("continuing filling out the form");
      setTimeout(() => {
        continueFillingInScheduleDates(newTeamSchedule, intIndex);
      }, pageTimeoutMilliseconds);
    } else {
      addError("could not find 'Single Date' option box");
    }
  } else {
    setTimeout(() => {
      console.log("waiting for main schedule form page to load...");
      waitForScheduleMainForm(newTeamSchedule, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const enterTeamSchedules = (newTeamSchedule,intIndex) => {
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
        addError("error: cannot continue since dateFullText is not defined in the object");
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
      enterTeamSchedules(newTeamSchedule,0);
    } else {
      console.error(`Not on the correct page. Please navigate to "Activities Page" and run again when the page header is "${activitiesPage_HeaderKeyText}"`);
    }
  } else {
    console.error('no team schedules passed');
  }
};