// Time estimate: 1 hour 10 minutes for 37 teams with ~15 weeks each

//wait at least this long before check page load status
const pageTimeoutMilliseconds = 3500;

//STRING CONSTANTS
const grantsPage_HeaderTagType = "h1";
const grantsPage_HeaderKeyText = "Agency Programs";
const activitiesPage_HeaderTagType = "h1";
const activitiesPage_HeaderKeyText = "ACTIVITIES";

//WORKER FUNCTIONS
const blWindowFramesExist = () => {return !!window && !!window.frames && !!window.frames.length > 0 && !!window.frames[0].document};
const getMainIFrameContent = () => {return window.frames[0].document;};
const convertHTMLCollectionToArray = (htmlCollection) => {return [].slice.call(htmlCollection);};
const getPageElementsByTagName = (tagName) => {return convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));};
const getPageElementsByClassName = (className) => {return getMainIFrameContent().getElementsByClassName(className);};
const getPageElementById = (domId) => {return getMainIFrameContent().getElementById(domId);};
const isOnActivitiesPage = () => {return getPageElementsByTagName(activitiesPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(activitiesPage_HeaderKeyText) === 0).length > 0;};
const isOnGrantsPage = () => getPageElementsByTagName(grantsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(grantsPage_HeaderKeyText) > -1).length > 0;
const getActivitiesPageLink = () => getPageElementsByTagName("span").filter(item => !!item.innerHTML && item.innerHTML.trim() === `Activities`);

const isOnAttendanceWeekMainForm = (link) => {
  let blReturn = false;
  convertHTMLCollectionToArray(getPageElementsByTagName(`form`)).map((item) => {
    const currentAction = item.getAttribute("action");
    if (currentAction === link) {
      blReturn = true;
    }
  });
  return blReturn;
};

const addError = (message) => {
  console.error(message);
  errorLog.push(message);
};

const waitForAttendanceWeekMainForm = (teamAttendanceParsed,intIndex,intAttempt) => {
  const weekStartSplit = teamAttendanceParsed[intIndex].weekStart.split("/");
  if (weekStartSplit.length === 3) {
    const expectedLink = `/Web/sms2/Services/AttendanceRecordsWeekly.asp?weekStart=${encodeURIComponent(`${parseInt(weekStartSplit[0])}/${parseInt(weekStartSplit[1])}/${parseInt(weekStartSplit[2])}`)}&ServiceID=${teamAttendanceParsed[intIndex].activityId}`
    if (isOnAttendanceWeekMainForm(expectedLink)) {
      console.log('setting attendance values...');
      const dateTextValues = convertHTMLCollectionToArray(convertHTMLCollectionToArray(getPageElementsByTagName(`thead`))[0].children[0].children).map((item) => item.innerHTML);
      const tableData = convertHTMLCollectionToArray(convertHTMLCollectionToArray(getPageElementsByTagName(`tbody`))[0].children);
      const studentNames = tableData.map((item) => item.children[0].innerHTML)
      let attendanceDataToPush = {};
      studentNames.map((item) => attendanceDataToPush[item] = teamAttendanceParsed[intIndex].attendanceData.filter((item_2) => item === item_2.name));
      Object.keys(attendanceDataToPush).map((item,index) => {
        attendanceDataToPush[item].map((item_2) => {
          const attendanceDateToEnter = item_2.originalDateString;
          const attendanceValue = item_2.attended;
          const columnIndex = dateTextValues.indexOf(attendanceDateToEnter);
          if (columnIndex > -1) {
            console.log(`Name=${item} | Date=${attendanceDateToEnter} | Attended=${attendanceValue}`);
            const matchingTableCell = tableData[index].children[columnIndex];
            convertHTMLCollectionToArray(matchingTableCell.children[0].children).map((item_3) => {
              const classList = convertHTMLCollectionToArray(item_3.classList);
              if (attendanceValue === "true") {
                if (classList.indexOf(`btn-p`) > -1) {
                  item_3.click();
                }
              }
              if (attendanceValue === "false") {
                if (classList.indexOf(`btn-a`) > -1) {
                  item_3.click();
                }
              }
            });
          }
        });
      });

      const saveButton = getPageElementById(`fixedbutton-save`);
      if (!!saveButton) {
        console.log("Saving...");
        saveButton.click();
      }
      setTimeout(() => {
        console.log("continuing to next set of attendance records...");
        enterTeamAttendance(teamAttendanceParsed,intIndex+1);
      }, pageTimeoutMilliseconds*2);
    } else {
      setTimeout(() => {
        if (intAttempt < 10) {
          console.log("waiting for team participant attendance week form page to load...");
          waitForAttendanceWeekMainForm(teamAttendanceParsed, intIndex, intAttempt + 1);
        } else {
          addError(`TOO MANY ATTEMPTS WAITING for index ${intIndex} with week start ${teamAttendanceParsed[intIndex].weekStart} and activity id ${teamAttendanceParsed[intIndex].activityId}`)
          console.log("running the same attendance request again")
          setTimeout(() => {
            enterTeamAttendance(teamAttendanceParsed,intIndex)
          })
        }
      }, pageTimeoutMilliseconds);
    }
  }
};

const enterTeamAttendance = (teamAttendanceParsed,intIndex) => {
  console.log(`Entering Attendance Record Set ${intIndex + 1} of ${teamAttendanceParsed.length}`);
  if (intIndex < teamAttendanceParsed.length) {
    if (!!teamAttendanceParsed[intIndex].weekStart) {
      if (!!teamAttendanceParsed[intIndex].activityId) {
        const weekStartSplit = teamAttendanceParsed[intIndex].weekStart.split("/");
        if (weekStartSplit.length === 3) {
          const weekStartEncoded = encodeURIComponent(`${parseInt(weekStartSplit[0])}/${parseInt(weekStartSplit[1])}/${parseInt(weekStartSplit[2])}`);
          top.DoLinkSubmit(`ActionSubmit~push; jump AttendanceRecordsWeekly.asp?WeekStart=${weekStartEncoded}&serviceFormatId=&serviceID=${teamAttendanceParsed[intIndex].activityId}`);
          waitForAttendanceWeekMainForm(teamAttendanceParsed, intIndex,0)
        }
      } else {
        addError("error: cannot continue since details.ActivityID is not defined in the object");
      }
    } else {
      addError("error: cannot continue since details is not defined in the object");
    }
  } else {
    console.log(`no more team participant registrations to enter - done with all ${teamAttendanceParsed.length} attendance record sets`);
    if (errorLog.length > 0) {
      console.error("SOME ERRORS WERE FOUND!");
      console.error(errorLog);
      console.error(JSON.stringify(errorLog));
    }
    callback_main(errorLog)
  }
};

let errorLog = [];

const waitForGroupActivitiesPageToLoad = () => {
  if (isOnActivitiesPage()) {
    enterTeamAttendance(teamAttendanceParsed,0);
  } else {
    console.log("waiting for group activities page to load...");
    setTimeout(() => {
      waitForGroupActivitiesPageToLoad();
    },pageTimeoutMilliseconds);
  }
};

const waitForMainDistrictPageToLoad = () => {
  console.log("checking if on main district page...");
  const groupActivitiesLinks = getActivitiesPageLink();
  if (groupActivitiesLinks.length > 0) {
    console.log("main district page loaded... clicking on group activities page...");
    groupActivitiesLinks[0].click();
    setTimeout(() => {
      waitForGroupActivitiesPageToLoad();
    },pageTimeoutMilliseconds);
  } else {
    console.log("not yet on main district page...");
    setTimeout(() => {
      waitForMainDistrictPageToLoad();
    },pageTimeoutMilliseconds);
  }
};

const clickNewestGrantLink = () => {
  const availableGrants = convertHTMLCollectionToArray(getPageElementsByTagName("a")).filter((item) => item.innerHTML.trim().indexOf(`America SCORES Soccer Program`) > -1);
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
    if (isOnActivitiesPage()) {
      enterTeamAttendance(teamAttendanceParsed,0);
    } else {
      console.log(`not starting on activities page - attempting to navigate via grants page...`);
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