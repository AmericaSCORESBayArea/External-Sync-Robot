//wait at least this long before check page load status
const pageTimeoutMilliseconds = 4000;

//STRING CONSTANTS
const youthParticipantsPage_HeaderTagType = "td";
const youthParticipantsPage_HeaderKeyText = "PARTICIPANTS &amp; STAFF";

//FORM NAME MAPPINGS - NAME AND DOB FORM
const formFieldTextInputs = {
  "FirstName~0":"FirstName",
  "LastName~0":"LastName",
  "DOB~0":"DateofBirth"
};
const formFieldDropDownInputs = {
  "ZipSelect~0":"Zip",
  "childrace~0":"Ethnicity",
  "Gender~0":"Gender"
};

//WORKER FUNCTIONS
const getMainIFrameContent = () => {return window.frames[0].document;};
const convertHTMLCollectionToArray = (htmlCollection) => {return [].slice.call(htmlCollection);};
const getPageElementsByTagName = (tagName) => {return convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));};
const getPageElementsByName = (name) => {return getMainIFrameContent().getElementsByName(name);};

const isOnYouthParticipantsPage = () => {return getPageElementsByTagName(youthParticipantsPage_HeaderTagType).filter((item) => {return !!item.innerHTML && item.innerHTML.indexOf(youthParticipantsPage_HeaderKeyText) > -1}).length > 0;};
const isOnSuccessfulRegistrationPage = () => {return getPageElementsByTagName("td").filter(item => !!item.innerHTML && item.innerHTML.indexOf("REGISTRATION SUCCESSFUL") > -1).length > 0;};

const isOnParticipantPage = (participantId) => {
  return convertHTMLCollectionToArray(getPageElementsByTagName("td")).filter((item) => {
    if (!!item.innerHTML) {
      if (`${item.innerHTML}`.trim() === `${participantId}`) {
        return true;
      }
    }
    return false
  }).length > 0;
};

const addError = (message) => {
  console.error(message);
  errorLog.push(message);
};

const setInputTextBoxValue = (textBox,newValue) => {
  try {
    textBox.value = `${newValue}`;
    return true;
  } catch(e) {
    addError("error with setInputTextBoxValue");
    addError(textBox);
    addError(newValue);
    addError(e);
  }
  return false;
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

const waitForMainYouthParticipantsPage = (newParticipantRegistrations,intIndex) => {
  if (isOnYouthParticipantsPage()) {
    enterParticipantRegistration(newParticipantRegistrations,intIndex);
  } else {
    setTimeout(() => {
      console.log("waiting for main participants page to load....");
      waitForMainYouthParticipantsPage(newParticipantRegistrations, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const waitForSuccessfulRegistrationMessage = (newParticipantRegistrations,intIndex) => {
  if (isOnSuccessfulRegistrationPage()) {
    console.log("registration appears successful... continuing to next participant");
    top.DoLinkSubmit('ActionSubmit~popjump');
    waitForMainYouthParticipantsPage(newParticipantRegistrations,parseInt(intIndex) + 1);
  } else {
    setTimeout(() => {
      console.log("waiting for success message....");
      waitForSuccessfulRegistrationMessage(newParticipantRegistrations, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const waitForParticipantPageLoad = (participantIds,intIndex) => {
  if (isOnParticipantPage(participantIds[intIndex])) {
    console.log(`participant page ${participantIds[intIndex]} found`);
    let blCheckedChanged = false;
    const youthIsParentForm = 'youthparent~0';
    const pageElements = convertHTMLCollectionToArray(getPageElementsByName(youthIsParentForm));
    if (pageElements.length > 0) {
      convertHTMLCollectionToArray(pageElements).map((item) => {
        const currentValue = item.getAttribute("value");
        if (!!currentValue) {
          if (`${currentValue}` === `2`) {
            item.checked = true;
            blCheckedChanged = true;
          }
        }
      });
    }
    if (blCheckedChanged) {
      console.log("set to 'NO' - saving...");
      top.DoLinkSubmit('ActionSubmit~Save; ');
    } else {
      addError(`${youthIsParentForm} not set as expected for ${participantIds[intIndex]}`);
    }
    setTimeout(() => {
      console.log("navigating to next participant");
      setParticipantIsAParent(participantIds,parseInt(intIndex) + 1);
    },pageTimeoutMilliseconds);
  } else {
    setTimeout(() => {
      console.log("waiting for participant page to load....");
      waitForParticipantPageLoad(participantIds, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const setParticipantIsAParent = (participantIds,intIndex) => {
  if (intIndex < participantIds.length) {
    console.log(`attempting set participant is a parent for participant ${intIndex + 1} of ${participantIds.length}`);
    top.DoLinkSubmit(`ActionSubmit~push; jump PersonForm.asp?PersonID=${participantIds[intIndex]}`);
    waitForParticipantPageLoad(participantIds,intIndex);
  } else {
    console.log(`no more participants - done with all ${participantIds.length} new participant is a parent.`);
    if (errorLog.length > 0) {
      console.error("SOME ERRORS WERE FOUND!");
      console.error(errorLog);
      console.error(JSON.stringify(errorLog));
    }
  }
};

let errorLog = [];

const mainPageController = (participantIds) => {
  if (!!participantIds && participantIds.length > 0) {
    console.log(`starting new participant set is youth a parent for ${participantIds.length} participants`);
    if (isOnYouthParticipantsPage()) {
      setParticipantIsAParent(participantIds,0);
    } else {
      console.error(`Not on the correct page. Please navigate to "Participants & Staff Page" and run again when the page header is like "${decodeURIComponent(youthParticipantsPage_HeaderKeyText)}"`);
    }
  } else {
    console.error('no participant registrations passed');
  }
};