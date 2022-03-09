//wait at least this long before check page load status
const pageTimeoutMilliseconds = 3000;

const instanceDate = new Date().toISOString();

//command
const command = `!REPLACE_COMMAND`

// callback server
const requestURL = '!REPLACE_API_SERVER'

// target collection
const resultsCollection = '!REPLACE_MONGO_COLLECTION'

//STRING CONSTANTS
const youthParticipantsPage_HeaderTagType = "h1";
const youthParticipantsPage_HeaderKeyText = "AGENCY YOUTH";

//WORKER FUNCTIONS
const blWindowFramesExist = () => {return !!window && !!window.frames && !!window.frames.length > 0 && !!window.frames[0].document};
const getMainIFrameContent = () => {return window.frames[0].document;};
const getPageElementsByClassName = (className) => {return getMainIFrameContent().getElementsByClassName(className);};
const convertHTMLCollectionToArray = (htmlCollection) => {return [].slice.call(htmlCollection);};
const getPageElementsByTagName = (tagName) => {return convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));};
const isOnYouthParticipantsPage = () => {return getPageElementsByTagName(youthParticipantsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML === youthParticipantsPage_HeaderKeyText).length > 0;};

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
    sendLog(`confirm removal page ${participantIdsToRemove[intIndex]} found`);
    top.DoLinkSubmit('ActionSubmit~delete');
    sendLog(`confirm delete has been clicked for ${participantIdsToRemove[intIndex]}`);
    setTimeout(() => {
      sendLog("continuing to next participant");
      removeParticipantRegistrations(participantIdsToRemove, parseInt(intIndex) + 1);
    },pageTimeoutMilliseconds*2);
  } else {
    setTimeout(() => {
      sendLog("waiting for participant confirm removal page to load....");
      waitForParticipantConfirmRemovalForm(participantIdsToRemove, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const waitForParticipantPageLoad = (participantIdsToRemove,intIndex) => {
  if (isOnParticipantPage(participantIdsToRemove[intIndex])) {
    sendLog(`participant page ${participantIdsToRemove[intIndex]} found`);
    top.DoLinkSubmit('ActionSubmit~Delete;');
    waitForParticipantConfirmRemovalForm(participantIdsToRemove,intIndex);
  } else {
    setTimeout(() => {
      sendLog("waiting for participant page to load....");
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
    sendLog(`navigating to participant details page ${participantIdsToRemove[intIndex]} (${intIndex + 1} of ${participantIdsToRemove.length})`);
    top.DoLinkSubmit(`ActionSubmit~push; jump PersonForm.asp?PersonID=${participantIdsToRemove[intIndex]}`);
    waitForParticipantPageLoad(participantIdsToRemove,intIndex);
  } else {
    sendLog(`no more registrations - done with removal of all ${participantIdsToRemove.length} registrations.`);
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
    sendLog(`starting removal of ${participantIdsToRemove.length} participants`);
    if (isOnYouthParticipantsPage()) {
      removeParticipantRegistrations(participantIdsToRemove,0);
    } else {
      console.error(`Not on the correct page. Please navigate to "Youth Participants Page" and run again when the page header is "${youthParticipantsPage_HeaderKeyText}"`);
    }
  } else {
    console.error('no participant ids');
  }
};