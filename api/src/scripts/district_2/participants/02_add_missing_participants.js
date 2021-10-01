//wait at least this long before check page load status
const pageTimeoutMilliseconds = 3000;

//initializing callback that will run with out data
let callback_main = null;

//STRING CONSTANTS
const grantsPage_HeaderTagType = "span";
const grantsPage_HeaderKeyText = "GRANT LIST";
const youthParticipantsPage_HeaderTagType = "td";
const youthParticipantsPage_HeaderKeyText = "PARTICIPANTS &amp; STAFF";

const defaultDOB = "1/1/2017";
const defaultZip = "94601";
const defaultEthnicity = "Some Other Race";
const defaultGender = "Prefer not to say";

//FORM NAME MAPPINGS - NAME AND DOB FORM
const formFieldTextInputs = {
  "FirstName~0":"FirstName",
  "LastName~0":"LastName",
  "DOB~0":"Birthdate"
};
const formFieldDropDownInputs = {
  "ZipSelect~0":"ZipCode",
  "childrace~0":"Ethnicity",
  "Gender~0":"Gender"
};

//WORKER FUNCTIONS
const blWindowFramesExist = () => {return !!window && !!window.frames && !!window.frames.length > 0 && !!window.frames[0].document};
const getMainIFrameContent = () => {return window.frames[0].document;};
const getPageElementsByClassName = (className) => {return getMainIFrameContent().getElementsByClassName(className);};
const convertHTMLCollectionToArray = (htmlCollection) => {return [].slice.call(htmlCollection);};
const getPageElementsByTagName = (tagName) => {return convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));};
const isOnYouthParticipantsPage = () => {return getPageElementsByTagName(youthParticipantsPage_HeaderTagType).filter((item) => {return !!item.innerHTML && item.innerHTML.indexOf(youthParticipantsPage_HeaderKeyText) > -1}).length > 0;};
const isOnNewRegistrationFormPage = () => {return getPageElementsByTagName("td").filter(item => !!item.innerHTML && item.innerHTML.indexOf("CREATE NEW YOUTH PARTICIPANTS") > -1).length > 0;};
const isOnSuccessfulRegistrationPage = () => {return getPageElementsByTagName("td").filter(item => !!item.innerHTML && item.innerHTML.indexOf("REGISTRATION SUCCESSFUL") > -1).length > 0;};
const isOnDuplicateRegistrationPage = () => {return getPageElementsByTagName("span").filter(item => !!item.innerHTML && item.innerHTML.indexOf("Click 'Accept Duplicate Record' to add a new record with this name.") > -1).length > 0;};
const isOnMainParticipantsSearchPage = () => getPageElementsByTagName(youthParticipantsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.indexOf(youthParticipantsPage_HeaderKeyText) > -1).length > 0;
const isOnGrantsPage = () => {return getPageElementsByTagName(grantsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(grantsPage_HeaderKeyText) > -1).length > 0;};
const getParticipantsAndStaffPageLink = () => getPageElementsByTagName("a").filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(`Participants &amp; Staff`) > -1);

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
        if (!!newParticipantRegistrations[intIndex][formFieldTextInputs[currentElementNameValue]]) {
          const newValue = newParticipantRegistrations[intIndex][formFieldTextInputs[currentElementNameValue].trim()];
          valueToPopulate = newValue;
          if (formFieldTextInputs[currentElementNameValue] === "Birthdate") {
            if (valueToPopulate.trim().length === 0) {
              console.log(`using default date of birth ${defaultDOB}`);
              valueToPopulate = defaultDOB;
            }
          }
          if (setInputTextBoxValue(item, valueToPopulate)) {
            intCountOfFieldsPopulated += 1;
            blValueSet = true;
          } else {
            addError("error: setting form was not found to be successful");
          }
        } else {
          addError(`error: root object does not have the matching object node ${formFieldTextInputs[currentElementNameValue]}`);
        }
        if (blValueSet === false) {
          console.log(`value not set as expected - attempting default value population for ${formFieldTextInputs[currentElementNameValue]} for "${newParticipantRegistrations[intIndex].fullName}"`);
          valueToPopulate = "";
          if (formFieldTextInputs[currentElementNameValue] === 'Birthdate') {
            valueToPopulate = defaultDOB;
          }
          if (valueToPopulate.trim().length > 0) {
            if (setInputTextBoxValue(item, valueToPopulate)) {
              intCountOfFieldsPopulated += 1;
              console.log(`setting default form successful - "${formFieldTextInputs[currentElementNameValue]}" of "${newParticipantRegistrations[intIndex][formFieldTextInputs[currentElementNameValue]]}" for "${newParticipantRegistrations[intIndex].fullName}"`);
            } else {
              addError(`error: setting default form was not successful - "${formFieldDropDownInputs[currentElementNameValue]}" of "${newParticipantRegistrations[intIndex][formFieldDropDownInputs[currentElementNameValue]]}" for "${newParticipantRegistrations[intIndex].fullName}"`);
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
        if (!!newParticipantRegistrations[intIndex][formFieldDropDownInputs[currentElementNameValue]]) {
          const newValue = newParticipantRegistrations[intIndex][formFieldDropDownInputs[currentElementNameValue]];
          valueToPopulate = newValue;
          if (setDropDownValue(item, valueToPopulate)) {
            intCountOfFieldsPopulated += 1;
            blValueSet = true;
          } else {
            addError(`error: setting form was not successful - "${formFieldDropDownInputs[currentElementNameValue]}" of "${newParticipantRegistrations[intIndex][formFieldDropDownInputs[currentElementNameValue]]}" for "${newParticipantRegistrations[intIndex].fullName}"`);
          }
        } else {
          addError(`error: root object does not have the matching object node ${formFieldDropDownInputs[currentElementNameValue]}`);
        }
        if (blValueSet === false) {
          console.log(`value not set as expected - attempting default value population for ${formFieldDropDownInputs[currentElementNameValue]} for "${newParticipantRegistrations[intIndex].fullName}"`);
          valueToPopulate = "";
          if (formFieldDropDownInputs[currentElementNameValue] === 'ZipCode') {
            valueToPopulate = defaultZip;
          }

          if (formFieldDropDownInputs[currentElementNameValue] === 'Ethnicity') {
            valueToPopulate = defaultEthnicity;
          }

          if (formFieldDropDownInputs[currentElementNameValue] === 'Gender') {
            valueToPopulate = defaultGender;
          }
          if (valueToPopulate.trim().length > 0) {
            if (setDropDownValue(item, valueToPopulate)) {
              intCountOfFieldsPopulated += 1;
              console.log(`setting default form successful - "${formFieldDropDownInputs[currentElementNameValue]}" of "${newParticipantRegistrations[intIndex][formFieldDropDownInputs[currentElementNameValue]]}" for "${newParticipantRegistrations[intIndex].fullName}"`);
            } else {
              addError(`error: setting default form was not successful - "${formFieldDropDownInputs[currentElementNameValue]}" of "${newParticipantRegistrations[intIndex][formFieldDropDownInputs[currentElementNameValue]]}" for "${newParticipantRegistrations[intIndex].fullName}"`);
            }
          } else {
            addError(`unable to set default value for ${formFieldDropDownInputs[currentElementNameValue]} for "${newParticipantRegistrations[intIndex].fullName}"`);
          }
        }
      }
    });
    if (intCountOfFieldsPopulated === expectedCountOfPopulatedFields) {
      console.log(`successfully populated all ${expectedCountOfPopulatedFields} fields for [district_2] participant`);
      top.DoLinkSubmit('ActionSubmit~add');
      waitForSuccessfulRegistrationMessage(newParticipantRegistrations, intIndex);
    } else {
      addError(`error: not all required fields have been set - ${expectedCountOfPopulatedFields} expected vs ${intCountOfFieldsPopulated} actual - canceling registration for index ${intIndex} (${newParticipantRegistrations[intIndex].fullName})`);
      top.DoLinkSubmit('ActionSubmit~popjump');
      waitForMainYouthParticipantsPage(newParticipantRegistrations, parseInt(intIndex) + 1);
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
    callback_main(errorLog);
  }
};

let errorLog = [];

const waitForMainParticipantsSearchPageToLoad = () => {
  if (isOnMainParticipantsSearchPage()) {
    enterParticipantRegistration(teamAttendanceParsed, 0);
  } else {
    console.log("waiting for main participants search page to load...");
    setTimeout(() => {
      waitForMainParticipantsSearchPageToLoad();
    },pageTimeoutMilliseconds);
  }
};

const waitForYouthParticipantsPageToLoad = () => {
  if (isOnYouthParticipantsPage()) {
    enterParticipantRegistration(teamAttendanceParsed, 0);
  } else {
    console.log("waiting for youth participants page to load...");
    setTimeout(() => {
      waitForYouthParticipantsPageToLoad();
    },pageTimeoutMilliseconds);
  }
};

const waitForMainDistrictPageToLoad = () => {
  console.log("checking if on main district page...");
  const groupParticipantsAndStaffLinks = getParticipantsAndStaffPageLink();
  if (groupParticipantsAndStaffLinks.length > 0) {
    console.log("main district page loaded... clicking on group participants page...");
    groupParticipantsAndStaffLinks[0].click();
    waitForMainParticipantsSearchPageToLoad();
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
    console.log(`starting add missing participants...`);
    if (isOnYouthParticipantsPage()) {
      console.log(`starting new participant registrations for ${teamAttendanceParsed.length} participants`);
      enterParticipantRegistration(teamAttendanceParsed, 0);
    } else {
      console.log(`not starting on participants page - attempting to navigate via grants page...`);
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