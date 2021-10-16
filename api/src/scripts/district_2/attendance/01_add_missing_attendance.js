//wait at least this long before check page load status
const pageTimeoutMilliseconds = 3000;

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
              blStartTimeSet = setDropDownValue(item,startTime);
            }
            if (currentName === "EndTime") {
              blEndTimeSet = setDropDownValue(item,endTime);
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
              enterTeamSchedules(newTeamSchedule,parseInt(intIndex) + 1);
            },pageTimeoutMilliseconds);
          }
        }
      });
    },pageTimeoutMilliseconds);
  } else {
    setTimeout(() => {
      console.log("waiting for main schedule single date form page to load...");
      waitForSingleDateScheduleForm(newTeamSchedule, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const waitForActivitiesPageBeforeNextTeam = (newServiceDateAttendance,intIndex) => {
  if (isOnActivitiesPage()) {
    console.log("navigating to service date...");
    enterServiceDateAttendance(newServiceDateAttendance, parseInt(intIndex) + 1);
  } else {
    setTimeout(() => {
      console.log("waiting for activities page to load before continuing to next service date id...");
      waitForActivitiesPageBeforeNextTeam(newServiceDateAttendance,intIndex);
    },pageTimeoutMilliseconds);
  }
};

const waitForServiceDateAttendanceMainForm = (newServiceDateAttendance,intIndex) => {
  if (isOnAttendancePage()) {
    console.log("ON CORRECT PAGE!");
    let arrayOfFoundOnPage = [];
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
                console.log(`${participantNameToLookFor} found in passed data object`);
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
                    console.log(`setting attendance value to ${matchingParticipant[0].attended === "false" ? "Absent" : "Present"}`);
                    inputBoxToSet.checked = true;
                  } else {
                    addError(`cannot set attendance for ServiceDateID (${newServiceDateAttendance[intIndex].serviceDateId}) for (${participantNameToLookFor}) since "attended" value is (${matchingParticipant[0].attended}) and only (true) or (false) are allowed`);
                  }
                } else {
                  addError(`cannot set attendance for ServiceDateID (${newServiceDateAttendance[intIndex].serviceDateId}) for (${participantNameToLookFor}) since no "attended" value is found in passed data`);
                }

              } else {
                if (matchingParticipant.length === 0) {
                  addError(`NO matching participant data passed for ServiceDateID (${newServiceDateAttendance[intIndex].serviceDateId}) for (${participantNameToLookFor}) - (aka, found on page but not in data)`);
                } else {
                  addError(`MORE THAN one matching participant found for ServiceDateID (${newServiceDateAttendance[intIndex].serviceDateId}) for (${participantNameToLookFor})`);
                }
              }
            }
          }
        }
      }
    });

    if (arrayOfFoundOnPage.length === newServiceDateAttendance[intIndex].attendanceData.length) {
      console.log(`all expected ${newServiceDateAttendance[intIndex].attendanceData.length} participants found on page`);
    } else {
      newServiceDateAttendance[intIndex].attendanceData.map((item) => {
        if (arrayOfFoundOnPage.indexOf(item.name) === -1) {
          addError(`expected participant (${item.name}) not found on ServiceDateID (${newServiceDateAttendance[intIndex].serviceDateId}) page!`);
        }
      });
    }

    console.log("saving");
    top.DoLinkSubmit('ActionSubmit~save; Set ListerPage 1; set Character %%');
    setTimeout(() => {
      console.log("navigating back...");
      top.DoLinkSubmit('ActionSubmit~save; popjump');
      waitForActivitiesPageBeforeNextTeam(newServiceDateAttendance,intIndex);
    },pageTimeoutMilliseconds*2);
  } else {
    setTimeout(() => {
      console.log("waiting for service date main attendance form page to load...");
      waitForServiceDateAttendanceMainForm(newServiceDateAttendance, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const enterServiceDateAttendance = (newServiceDateAttendance,intIndex) => {
  if (intIndex < newServiceDateAttendance.length) {
    if (!!newServiceDateAttendance[intIndex].serviceDateId) {
      if (!!newServiceDateAttendance[intIndex].attendanceData) {
        console.log(`Adding Service Date Schedule ${intIndex + 1} of ${newServiceDateAttendance.length}`);
        top.DoLinkSubmit(`ActionSubmit~push; jump AttendanceByService.asp?ServiceDateID=${newServiceDateAttendance[intIndex].serviceDateId}`);
        waitForServiceDateAttendanceMainForm(newServiceDateAttendance, intIndex);
      } else {
        addError("error: cannot continue since attendanceData is not defined in the object");
      }
    } else {
      addError("error: cannot continue since serviceDateId is not defined in the object");
    }
  } else {
    console.log(`no more team schedules to enter - done with all ${newServiceDateAttendance.length} service date attendances.`);
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
    enterServiceDateAttendance(teamAttendanceParsed, 0);
  } else {
    console.log("waiting for main group activities page to load...");
    console.log("TEAM SCHEDULE HERE")
    console.log(teamAttendanceParsed)

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
    console.log(`starting add attendance...`);
    if (isOnYouthParticipantsPage()) {
      console.log(`starting add attendance ${teamAttendanceParsed.length} dates...`);
      enterServiceDateAttendance(teamAttendanceParsed, 0);
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

mainPageController()