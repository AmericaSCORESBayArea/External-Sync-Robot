//README
//    after uploading the "present" data excel template, this will go through all found teams and set buttons that aren't explicitly set to "present" to "absent"
//    use the view: "team_details_verify" as input and it will iterate through all the teams and whatever schedule is found - there is no check for dates or names, just any checkbox found
//    afterwards
//        [1] need to manually copy/paste values from the view "attendance_import_data_view"
//        [2] need to rerun the script "01_get_existing_teams_and_schedule.js"

// Time estimate: 1 hour 10 minutes for 37 teams with ~15 weeks each

//wait at least this long before check page load status
const pageTimeoutMilliseconds = 3500;

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
const getPageElementsByClassName = (className) => {return getMainIFrameContent().getElementsByClassName(className);};
const isOnActivitiesPage = () => {return getPageElementsByTagName(activitiesPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(activitiesPage_HeaderKeyText) === 0).length > 0;};

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

const addError = (message) => {
  console.error(message);
  errorLog.push(message);
};

const waitUntilActivityPageAppears = (newTeamSchedule,intIndex) => {
  if (isOnActivitiesPage()) {
    console.log("continuing to the next schedule entry");
    enterTeamParticipants(newTeamSchedule,parseInt(intIndex) + 1);
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

const waitForConfirmSavedRegistrationForm = (newTeamParticipants,intIndex) => {
  if (isOnTeamParticipantRegistrationSaveConfirmedPage()) {
    console.log(`team registration confirmed for ${newTeamParticipants[intIndex].teamId}`);
    top.DoLinkSubmit('ActionSubmit~PopJump; ');
    setTimeout(() => {
      console.log("continuing to next registration");
      enterTeamParticipants(newTeamParticipants,parseInt(intIndex) + 1);
    }, pageTimeoutMilliseconds);
  } else {
    setTimeout(() => {
      console.log("waiting for team participant registration confirmed saved form page to load...");
      waitForConfirmSavedRegistrationForm(newTeamParticipants, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const waitForConfirmRegistrationForm = (newTeamParticipants,intIndex) => {
  if (isOnTeamParticipantRegistrationConfirmForm()) {
    console.log(`confirming selection for ${newTeamParticipants[intIndex].teamId}`);
    top.DoLinkSubmit('ActionSubmit~Next2;');
    waitForConfirmSavedRegistrationForm(newTeamParticipants,intIndex);
  } else {
    setTimeout(() => {
      console.log("waiting for team participant registration confirm form page to load...");
      waitForConfirmRegistrationForm(newTeamParticipants, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const waitForAttendanceWeekMainForm = (newTeamParticipants,intIndex,attendanceWeekDateRangeLinks,intWeekIndex) => {
  if (isOnAttendanceWeekMainForm(attendanceWeekDateRangeLinks[intWeekIndex])) {
    console.log('setting remaining to absent...');
    let intAbsentClickCount = 0;
    const currentButtonGroupsFound =  convertHTMLCollectionToArray(getPageElementsByClassName(`btn-group`));
    if (!!currentButtonGroupsFound) {
      if (currentButtonGroupsFound.length > 0) {
        currentButtonGroupsFound.map((item) => {
          if (!!item.children) {
            let blPresentIsChecked = false;
            let blAbsentIsChecked = false;

            let presentElement = null;
            let absentElement = null;

            convertHTMLCollectionToArray(item.children).map((item_2) => {
              const currentInnerHTML = `${item_2.innerHTML}`;
              const blIsPresentElement = currentInnerHTML.indexOf(`/span>P`) > -1;
              const blIsAbsentElement = currentInnerHTML.indexOf(`/span>A`) > -1;

              const blCurrentElementIsSelected = item_2.getAttribute('class').indexOf(`jcf-label-active`) > -1;

              if (blIsPresentElement) {
                presentElement = item_2;
                if (blCurrentElementIsSelected) {
                  blPresentIsChecked = true;
                }
              }
              if (blIsAbsentElement) {
                absentElement = item_2;
                if (blCurrentElementIsSelected) {
                  blAbsentIsChecked = true;
                }
              }
            });
            if (blPresentIsChecked === false) {
              if (blPresentIsChecked === blAbsentIsChecked) {
                if (!!absentElement) {
                  absentElement.click();
                  intAbsentClickCount += 1;
                }
              }
            }
          }
        });
      }
    }
    if (intAbsentClickCount > 0) {
      console.log(`selected absent for ${intAbsentClickCount} participant${intAbsentClickCount !== 1 ? "s" : ""}`);
      console.log('saving...');
      top.DoLinkSubmit('ActionSubmit~Save; ');
      setTimeout(() => {
        console.log('navigating to next attendance week');
        navigateToAttendanceWeekMainForm(newTeamParticipants,intIndex,attendanceWeekDateRangeLinks,parseInt(intWeekIndex) + 1);
      },pageTimeoutMilliseconds);
    } else {
      console.log("nothing to select...");
      navigateToAttendanceWeekMainForm(newTeamParticipants,intIndex,attendanceWeekDateRangeLinks,parseInt(intWeekIndex) + 1);
    }
  } else {
    setTimeout(() => {
      console.log("waiting for team participant attendance week form page to load...");
      waitForAttendanceWeekMainForm(newTeamParticipants,intIndex,attendanceWeekDateRangeLinks,intWeekIndex);
    }, pageTimeoutMilliseconds);
  }
};

const navigateToAttendanceWeekMainForm = (newTeamParticipants,intIndex,attendanceWeekDateRangeLinks,intWeekIndex) => {
  if (intWeekIndex < attendanceWeekDateRangeLinks.length) {
    console.log(`navigating to week ${intWeekIndex + 1} of ${attendanceWeekDateRangeLinks.length} for team ${intIndex + 1} of ${newTeamParticipants.length}`);
    top.DoLinkSubmit(attendanceWeekDateRangeLinks[intWeekIndex].split(`top.DoLinkSubmit('`).join('').split(`');`).join(''));
    waitForAttendanceWeekMainForm(newTeamParticipants, intIndex, attendanceWeekDateRangeLinks, intWeekIndex)
  } else {
    console.log("no more attendance weeks for this team - continuing to next team");
    enterTeamRemainingAbsent(newTeamParticipants,parseInt(intIndex) + 1);
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
              let blIsAlreadyComplete = false;
              if (!!item.parentNode) {
                if (!!item.parentNode.nextSibling) {
                  if (!!item.parentNode.nextSibling.children) {
                    if (!!item.parentNode.nextSibling.innerHTML) {
                      if (item.parentNode.nextSibling.innerHTML.trim().toLowerCase().indexOf(">complete</") > -1) {     //do not bother if already set to "COMPLETE" - no values need to be set here (some may be present and some may be absent)
                        blIsAlreadyComplete = true;
                      }
                    }
                  }
                }
              }
              if (blIsAlreadyComplete === false) {
                attendanceWeekDateRangeLinks.push(`${currentOnClick}`.split(`return false;`).join(''));
              } else {
                console.log("skipping since already set to complete - nothing to do here");
              }
            }
          }
        }
      } catch(e) {
        console.error("some stray error with waitForTeamAttendanceMainForm!");
        console.error(e);
      }
    });

    if (attendanceWeekDateRangeLinks.length > 0) {
      console.log(`found - ${attendanceWeekDateRangeLinks.length} attendance weeks - navigating to the first`);
      navigateToAttendanceWeekMainForm(newTeamParticipants,intIndex,attendanceWeekDateRangeLinks,0);
    } else {
      console.log(`no attendance data found or nothing needs to be set - continuing to next team`);
      enterTeamRemainingAbsent(newTeamParticipants,parseInt(intIndex) + 1);
    }
  } else {
    setTimeout(() => {
      console.log("waiting for main team participant attendance form page to load...");
      waitForTeamAttendanceMainForm(newTeamParticipants, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const enterTeamRemainingAbsent = (newTeamParticipants,intIndex) => {
  if (intIndex < newTeamParticipants.length) {
    if (!!newTeamParticipants[intIndex].details) {
      if (!!newTeamParticipants[intIndex].details.ActivityID) {
        if (!!newTeamParticipants[intIndex].details.ActivityName) {
          console.log(`continuing setting remaining absent ${intIndex + 1} of ${newTeamParticipants.length} teams`);
          console.log(`activity ${newTeamParticipants[intIndex].details.ActivityID}`);
          top.DoLinkSubmit(`ActionSubmit~save; ; jump /Web/sms2/Services/AttendanceRecordsWeekly.asp?ServiceID=${newTeamParticipants[intIndex].details.ActivityID};`);
          waitForTeamAttendanceMainForm(newTeamParticipants, intIndex);
        } else {
          addError("error: cannot continue since details.ActivityName is not defined in the object");
        }
      } else {
        addError("error: cannot continue since details.ActivityID is not defined in the object");
      }
    } else {
      addError("error: cannot continue since details is not defined in the object");
    }
  } else {
    console.log(`no more team participant registrations to enter - done with all ${newTeamParticipants.length} team set remaining attendance to absent.`);
    if (errorLog.length > 0) {
      console.error("SOME ERRORS WERE FOUND!");
      console.error(errorLog);
      console.error(JSON.stringify(errorLog));
    }
  }
};

let errorLog = [];

const mainPageController = (newTeamParticipants) => {
  if (!!newTeamParticipants && newTeamParticipants.length > 0) {
    console.log(`starting setting team remaining absent for ${newTeamParticipants.length} teams`);
    if (isOnActivitiesPage()) {
      enterTeamRemainingAbsent(newTeamParticipants,0);
    } else {
      console.error(`Not on the correct page. Please navigate to "Activities Page" and run again when the page header is "${activitiesPage_HeaderKeyText}"`);
    }
  } else {
    console.error('no team participant registrations passed');
  }
};