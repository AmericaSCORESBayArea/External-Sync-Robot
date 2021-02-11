//wait at least this long before check page load status
const pageTimeoutMilliseconds = 3000;

//STRING CONSTANTS
const youthParticipantsPage_HeaderTagType = "td";
const youthParticipantsPage_HeaderKeyText = "PARTICIPANTS &amp; STAFF";

const defaultDOB = "1/1/2017";
const defaultZip = "94601";
const defaultEthnicity = "Some Other Race";
const defaultGender = "Prefer not to say";

//FORM NAME MAPPINGS - NAME AND DOB FORM
const formFieldTextInputs = {
  "FirstName~0":"firstName",
  "LastName~0":"lastName",
  "DOB~0":"dateOfBirth"
};
const formFieldDropDownInputs = {
  "ZipSelect~0":"zip",
  "childrace~0":"ethnicity",
  "Gender~0":"gender"
};

//WORKER FUNCTIONS
const blWindowFramesExist = () => {return !!window && !!window.frames && !!window.frames.length > 0 && !!window.frames[0].document};
const getMainIFrameContent = () => {return window.frames[0].document;};
const convertHTMLCollectionToArray = (htmlCollection) => {return [].slice.call(htmlCollection);};
const getPageElementsByTagName = (tagName) => {return convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));};
const isOnYouthParticipantsPage = () => {return getPageElementsByTagName(youthParticipantsPage_HeaderTagType).filter((item) => {return !!item.innerHTML && item.innerHTML.indexOf(youthParticipantsPage_HeaderKeyText) > -1}).length > 0;};
const isOnNewRegistrationFormPage = () => {return getPageElementsByTagName("td").filter(item => !!item.innerHTML && item.innerHTML.indexOf("CREATE NEW YOUTH PARTICIPANTS") > -1).length > 0;};
const isOnSuccessfulRegistrationPage = () => {return getPageElementsByTagName("td").filter(item => !!item.innerHTML && item.innerHTML.indexOf("REGISTRATION SUCCESSFUL") > -1).length > 0;};
const isOnDuplicateRegistrationPage = () => {return getPageElementsByTagName("span").filter(item => !!item.innerHTML && item.innerHTML.indexOf("Click 'Accept Duplicate Record' to add a new record with this name.") > -1).length > 0;};

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
    if (isOnDuplicateRegistrationPage()) {
      console.log("registration appears to be a duplicate... canceling and continuing to next participant");
      top.DoLinkSubmit('ActionSubmit~popjump');
      waitForMainYouthParticipantsPage(newParticipantRegistrations,parseInt(intIndex) + 1);
    } else {
      setTimeout(() => {
        console.log("waiting for success message....");
        waitForSuccessfulRegistrationMessage(newParticipantRegistrations, intIndex);
      }, pageTimeoutMilliseconds);
    }
  }
};

const waitForNewRegistrationForm = (newParticipantRegistrations,intIndex) => {
  if (isOnNewRegistrationFormPage()) {
    let intCountOfFieldsPopulated = 0;
    const expectedCountOfPopulatedFields = Object.keys(formFieldTextInputs).length + Object.keys(formFieldDropDownInputs).length;
    convertHTMLCollectionToArray(getPageElementsByTagName("input")).map((item) => {
      const currentElementNameValue = item.getAttribute("name");
      if (!!formFieldTextInputs[currentElementNameValue]) {
        let blValueSet = false;
        let valueToPopulate = "";
        if (!!newParticipantRegistrations[intIndex].rootDoc) {
          if (!!newParticipantRegistrations[intIndex].rootDoc[formFieldTextInputs[currentElementNameValue]]) {
            const newValue = newParticipantRegistrations[intIndex].rootDoc[formFieldTextInputs[currentElementNameValue].trim()];
            valueToPopulate = newValue;
            if (formFieldTextInputs[currentElementNameValue] === "dateOfBirth" ) {
              if (valueToPopulate.trim().length === 0) {
                console.log(`using default date of birth ${defaultDOB}`);
                valueToPopulate = defaultDOB;
              }
            }
            if (setInputTextBoxValue(item, valueToPopulate)) {
              intCountOfFieldsPopulated+=1;
              blValueSet = true;
            } else {
              addError("error: setting form was not found to be successful");
            }
          } else {
            addError(`error: root object does not have the matching object node ${formFieldTextInputs[currentElementNameValue]}`);
          }
        } else {
          addError(`error: root object not found for index ${intIndex} (${newParticipantRegistrations[intIndex].fullName})`);
        }
        if (blValueSet === false) {
          console.log(`value not set as expected - attempting default value population for ${formFieldTextInputs[currentElementNameValue]} for "${newParticipantRegistrations[intIndex].fullName}"`);
          valueToPopulate = "";
          if (formFieldTextInputs[currentElementNameValue] === 'dateOfBirth') {
            valueToPopulate = defaultDOB;
          }
          if (valueToPopulate.trim().length > 0) {
            if (setInputTextBoxValue(item, valueToPopulate)) {
              intCountOfFieldsPopulated+=1;
              console.log(`setting default form successful - "${formFieldTextInputs[currentElementNameValue]}" of "${newParticipantRegistrations[intIndex].rootDoc[formFieldTextInputs[currentElementNameValue]]}" for "${newParticipantRegistrations[intIndex].fullName}"`);
            } else {
              addError(`error: setting default form was not successful - "${formFieldDropDownInputs[currentElementNameValue]}" of "${newParticipantRegistrations[intIndex].rootDoc[formFieldDropDownInputs[currentElementNameValue]]}" for "${newParticipantRegistrations[intIndex].fullName}"`);
            }
          } else {
            addError(`unable to set default value for ${formFieldDropDownInputs[currentElementNameValue]} for "${newParticipantRegistrations[intIndex].fullName}"`);
          }
        }
      }
    });


    convertHTMLCollectionToArray(getPageElementsByTagName("select")).map((item) => {
      const currentElementNameValue = item.getAttribute("name");
      if (!!formFieldDropDownInputs[currentElementNameValue]) {
        let blValueSet = false;
        let valueToPopulate = "";
        if (!!newParticipantRegistrations[intIndex].rootDoc) {
          if (!!newParticipantRegistrations[intIndex].rootDoc[formFieldDropDownInputs[currentElementNameValue]]) {
            const newValue = newParticipantRegistrations[intIndex].rootDoc[formFieldDropDownInputs[currentElementNameValue]];
            valueToPopulate = newValue;
            if (setDropDownValue(item, valueToPopulate)) {
              intCountOfFieldsPopulated+=1;
              blValueSet = true;
            } else {
              addError(`error: setting form was not successful - "${formFieldDropDownInputs[currentElementNameValue]}" of "${newParticipantRegistrations[intIndex].rootDoc[formFieldDropDownInputs[currentElementNameValue]]}" for "${newParticipantRegistrations[intIndex].fullName}"`);
            }
          } else {
            addError(`error: root object does not have the matching object node ${formFieldDropDownInputs[currentElementNameValue]}`);
          }
        } else {
          addError(`error: root object not found for index ${intIndex} (${newParticipantRegistrations[intIndex].fullName})`);
        }
        if (blValueSet === false) {
          console.log(`value not set as expected - attempting default value population for ${formFieldDropDownInputs[currentElementNameValue]} for "${newParticipantRegistrations[intIndex].fullName}"`);
          valueToPopulate = "";
          if (formFieldDropDownInputs[currentElementNameValue] === 'zip') {
            valueToPopulate = defaultZip;
          }

          if (formFieldDropDownInputs[currentElementNameValue] === 'ethnicity') {
            valueToPopulate = defaultEthnicity;
          }

          if (formFieldDropDownInputs[currentElementNameValue] === 'gender') {
            valueToPopulate = defaultGender;
          }
          if (valueToPopulate.trim().length > 0) {
            if (setDropDownValue(item, valueToPopulate)) {
              intCountOfFieldsPopulated+=1;
              console.log(`setting default form successful - "${formFieldDropDownInputs[currentElementNameValue]}" of "${newParticipantRegistrations[intIndex].rootDoc[formFieldDropDownInputs[currentElementNameValue]]}" for "${newParticipantRegistrations[intIndex].fullName}"`);
            } else {
              addError(`error: setting default form was not successful - "${formFieldDropDownInputs[currentElementNameValue]}" of "${newParticipantRegistrations[intIndex].rootDoc[formFieldDropDownInputs[currentElementNameValue]]}" for "${newParticipantRegistrations[intIndex].fullName}"`);
            }
          } else {
            addError(`unable to set default value for ${formFieldDropDownInputs[currentElementNameValue]} for "${newParticipantRegistrations[intIndex].fullName}"`);
          }
        }
      }
    });

    if (intCountOfFieldsPopulated === expectedCountOfPopulatedFields ) {
      console.log(`successfully populated all ${expectedCountOfPopulatedFields} fields for [district_2] participant`);
      top.DoLinkSubmit('ActionSubmit~add');
      waitForSuccessfulRegistrationMessage(newParticipantRegistrations, intIndex);
    } else {
      addError(`error: not all required fields have been set - ${expectedCountOfPopulatedFields} expected vs ${intCountOfFieldsPopulated} actual - canceling registration for index ${intIndex} (${newParticipantRegistrations[intIndex].fullName})`);
      top.DoLinkSubmit('ActionSubmit~popjump');
      waitForMainYouthParticipantsPage(newParticipantRegistrations,parseInt(intIndex) + 1);
    }
  } else {
    setTimeout(() => {
      console.log("waiting for main registration form page to load...");
      waitForNewRegistrationForm(newParticipantRegistrations, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const enterParticipantRegistration = (newParticipantRegistrations,intIndex) => {
  if (intIndex < newParticipantRegistrations.length) {
    console.log(`attempting registration for participant ${intIndex + 1} of ${newParticipantRegistrations.length}`);
    top.DoLinkSubmit('ActionSubmit~save; ; jump /Web/sms/Persons/AddPerson.asp?PersonTypeID=1;');
    waitForNewRegistrationForm(newParticipantRegistrations,intIndex);
  } else {
    console.log(`no more registrations - done with all ${newParticipantRegistrations.length} new registrations.`);
    if (errorLog.length > 0) {
      console.error("SOME ERRORS WERE FOUND!");
      console.error(errorLog);
      console.error(JSON.stringify(errorLog));
    }
  }
};

let errorLog = [];

const mainPageController = (newParticipantRegistrations) => {
  if (!!newParticipantRegistrations && newParticipantRegistrations.length > 0) {
    console.log(`starting new participant registrations for ${newParticipantRegistrations.length} participants`);
    if (isOnYouthParticipantsPage()) {
      enterParticipantRegistration(newParticipantRegistrations,0);
    } else {
      console.error(`Not on the correct page. Please navigate to "Participants & Staff Page" and run again when the page header is like "${decodeURIComponent(youthParticipantsPage_HeaderKeyText)}"`);
    }
  } else {
    console.error('no participant registrations passed');
  }
};