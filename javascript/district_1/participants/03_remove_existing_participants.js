//wait at least this long before check page load status
const pageTimeoutMilliseconds = 3000;

//STRING CONSTANTS
const youthParticipantsPage_HeaderTagType = "h1";
const youthParticipantsPage_HeaderKeyText = "AGENCY YOUTH";

//WORKER FUNCTIONS
const getMainIFrameContent = () => {return window.frames[0].document;};
const getPageElementsByClassName = (className) => {return getMainIFrameContent().getElementsByClassName(className);};
const convertHTMLCollectionToArray = (htmlCollection) => {return [].slice.call(htmlCollection);};
const getPageElementsByTagName = (tagName) => {return convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));};
const isOnYouthParticipantsPage = () => {return getPageElementsByTagName(youthParticipantsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML === youthParticipantsPage_HeaderKeyText).length > 0;};

const addError = (message) => {
  console.error(message);
  errorLog.push(message);
};

const isOnParticipantPage = (participantId) => {
  return convertHTMLCollectionToArray(getPageElementsByClassName("form-item-text")).filter((item) => {
    if (!!item.innerHTML) {
      if (`${item.innerHTML}` === `${participantId}`) {
        return true;
      }
    }
    return false
  }).length > 0;
};

const isOnParticipantConfirmRemovalFormPage = () => {
  return convertHTMLCollectionToArray(getPageElementsByTagName("h1")).filter((item) => {
    if (!!item.innerHTML) {
      if (`${item.innerHTML}` === `DELETE PERSON`) {
        return true;
      }
    }
    return false
  }).length > 0;
};

const waitForParticipantConfirmRemovalForm = (participantIdsToRemove,intIndex) => {
  if (isOnParticipantConfirmRemovalFormPage()) {
    console.log(`confirm removal page ${participantIdsToRemove[intIndex]} found`);
    top.DoLinkSubmit('ActionSubmit~delete');
    console.log(`confirm delete has been clicked for ${participantIdsToRemove[intIndex]}`);
    setTimeout(() => {
      console.log("continuing to next participant");
      removeParticipantRegistrations(participantIdsToRemove, parseInt(intIndex) + 1);
    },pageTimeoutMilliseconds*2);
  } else {
    setTimeout(() => {
      console.log("waiting for participant confirm removal page to load....");
      waitForParticipantConfirmRemovalForm(participantIdsToRemove, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const waitForParticipantPageLoad = (participantIdsToRemove,intIndex) => {
  if (isOnParticipantPage(participantIdsToRemove[intIndex])) {
    console.log(`participant page ${participantIdsToRemove[intIndex]} found`);
    top.DoLinkSubmit('ActionSubmit~Delete;');
    waitForParticipantConfirmRemovalForm(participantIdsToRemove,intIndex);
  } else {
    setTimeout(() => {
      console.log("waiting for participant page to load....");
      try {
        waitForParticipantPageLoad(participantIdsToRemove, intIndex);
      } catch(e) {
        addError(`there was an error - the Participant ID ${participantIdsToRemove[intIndex]} may not exist`);
        console.error(e);
        console.error("error: manual intervention required");
        setTimeout(() => {
          removeParticipantRegistrations(participantIdsToRemove, parseInt(intIndex) + 1);
        },pageTimeoutMilliseconds*2);
      }
    }, pageTimeoutMilliseconds);
  }
};

const removeParticipantRegistrations = (participantIdsToRemove,intIndex) => {
  if (intIndex < participantIdsToRemove.length) {
    console.log(`navigating to participant details page ${participantIdsToRemove[intIndex]} (${intIndex + 1} of ${participantIdsToRemove.length})`);
    top.DoLinkSubmit(`ActionSubmit~push; jump PersonForm.asp?PersonID=${participantIdsToRemove[intIndex]}`);
    waitForParticipantPageLoad(participantIdsToRemove,intIndex);
  } else {
    console.log(`no more registrations - done with removal of all ${participantIdsToRemove.length} registrations.`);
    if (errorLog.length > 0) {
      console.error("SOME ERRORS WERE FOUND!");
      console.error(errorLog);
      console.error(JSON.stringify(errorLog));
    }
  }
};

let errorLog = [];

const mainPageController = (participantIdsToRemove) => {
  if (!!participantIdsToRemove && participantIdsToRemove.length > 0) {
    console.log(`starting removal of ${participantIdsToRemove.length} participants`);
    if (isOnYouthParticipantsPage()) {
      removeParticipantRegistrations(participantIdsToRemove,0);
    } else {
      console.error(`Not on the correct page. Please navigate to "Youth Participants Page" and run again when the page header is "${youthParticipantsPage_HeaderKeyText}"`);
    }
  } else {
    console.error('no participant ids');
  }
};