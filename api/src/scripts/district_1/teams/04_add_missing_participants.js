//README
//    use the view: "attendance_team_complete_participant_enrollment_not_found_with_teamId_found_and_participantId_found" as input
//    afterwards, need to rerun the script "01_get_existing_teams_and_schedule.js"
// Time estimate: 10 minutes for 34 teams with 454 participants

//wait at least this long before check page load status
const pageTimeoutMilliseconds = 3000;

//STRING CONSTANTS
const activitiesPage_HeaderTagType = "h1";
const activitiesPage_HeaderKeyText = "ACTIVITIES";
const activityDetailsPage_HeaderTagType = "h1";
const activityDetailsPage_HeaderKeyText = "ACTIVITY DETAILS";
const enrollmentAddMainPage_HeaderTagType = "h1";
const enrollmentAddMainPage_HeaderKeyText = "ENROLL PARTICIPANT(S)";
const enrollmentAddConfirmPage_HeaderTagType = "h4";
const enrollmentAddConfirmPage_HeaderKeyText = "Indicate the begin enrollment date for each participant";
const enrollmentConfirmedPage_HeaderTagType = "h1";
const enrollmentConfirmedPage_HeaderKeyText = "ENROLLMENT CONFIRMED";

//WORKER FUNCTIONS
const blWindowFramesExist = () => {return !!window && !!window.frames && !!window.frames.length > 0 && !!window.frames[0].document};
const getMainIFrameContent = () => {return window.frames[0].document;};
const convertHTMLCollectionToArray = (htmlCollection) => {return [].slice.call(htmlCollection);};
const getPageElementsByTagName = (tagName) => {return convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));};
const getPageElementById = (id) => {return getMainIFrameContent().getElementById(id);};
const isOnActivitiesPage = () => {return getPageElementsByTagName(activitiesPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(activitiesPage_HeaderKeyText) === 0).length > 0;};
const isOnTeamParticipantRegistrationMainForm = () => {return getPageElementsByTagName(enrollmentAddMainPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML === enrollmentAddMainPage_HeaderKeyText).length > 0;};
const isOnTeamParticipantRegistrationConfirmForm = () => {return getPageElementsByTagName(enrollmentAddConfirmPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML === enrollmentAddConfirmPage_HeaderKeyText).length > 0;};
const isOnTeamParticipantRegistrationSaveConfirmedPage = () => {return getPageElementsByTagName(enrollmentConfirmedPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML === enrollmentConfirmedPage_HeaderKeyText).length > 0;};

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

const waitForTeamParticipantRegistrationMainForm = (newTeamParticipants,intIndex) => {
  if (isOnTeamParticipantRegistrationMainForm()) {
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
                    console.log(`selected participant id ${currentValue.trim()}`);
                    selectedParticipants.push(currentValue.trim());
                  }
                }
              }
            }
          }
        }
      } catch(e) {
        console.error("some stray error!");
        console.error(e);
      }
    });
    newTeamParticipants[intIndex].registered_participants.map((item) => {
      if (selectedParticipants.indexOf(item.participantId) === -1) {
        addError(`the participant was not selected for some reason - please check (${JSON.stringify(item)})`);
      }
    });
    if (selectedParticipants.length > 0) {
      console.log(`${selectedParticipants.length} participants selected - continuing`);
      top.DoLinkSubmit('ActionSubmit~Next1; ');
      waitForConfirmRegistrationForm(newTeamParticipants,intIndex);
    } else {
      addError(`no participants selected for teamId ${newTeamParticipants[intIndex].teamId} - continuing to next team`);
      enterTeamParticipants(newTeamParticipants,parseInt(intIndex) + 1);
    }
  } else {
    setTimeout(() => {
      console.log("waiting for main team participant registration form page to load...");
      waitForTeamParticipantRegistrationMainForm(newTeamParticipants, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const enterTeamParticipants = (newTeamParticipants,intIndex) => {
  if (intIndex < newTeamParticipants.length) {
    if (!!newTeamParticipants[intIndex].teamId) {
      if (!!newTeamParticipants[intIndex].registered_participants) {
        if (!!newTeamParticipants[intIndex].registered_participants.length > 0) {
          console.log(`continuing registration ${intIndex + 1 } of ${newTeamParticipants.length} participants for team ${newTeamParticipants[intIndex].teamId}`);
          top.DoLinkSubmit(`ActionSubmit~Push ; Jump EnrollWizard.asp?ServiceID=${newTeamParticipants[intIndex].teamId};`);
          waitForTeamParticipantRegistrationMainForm(newTeamParticipants, intIndex);
        } else {
          addError("error: cannot continue since there are no registered_participants found in the object");
        }
      } else {
        addError("error: cannot continue since registered_participants is not defined in the object");
      }
    } else {
      addError("error: cannot continue since activityId is not defined in the object");
    }
  } else {
    console.log(`no more team participant registrations to enter - done with all ${newTeamParticipants.length} new team participant registrations.`);
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
    console.log(`starting new team participant registration for ${newTeamParticipants.length} teams`);
    if (isOnActivitiesPage()) {
      enterTeamParticipants(newTeamParticipants,0);
    } else {
      console.error(`Not on the correct page. Please navigate to "Activities Page" and run again when the page header is "${activitiesPage_HeaderKeyText}"`);
    }
  } else {
    console.error('no team participant registrations passed');
  }
};