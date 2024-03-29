//README
//    use the view: "registration_csv_missing_view" as input
//    afterwards, need to rerun the script "01_get_existing_participants.js"
// Time estimate: 2.5 hours to import  330 participants


//todo need to add logic to handle if the same student is entered multiple times - there is a specific error message displayed on the page and need to essentially cancel and log the message

const instanceDate = new Date().toISOString();

//command
const command = `!REPLACE_COMMAND`

// callback server
const requestURL = '!REPLACE_API_SERVER'

// target collection
const resultsCollection = '!REPLACE_MONGO_COLLECTION'

//wait at least this long before check page load status
const pageTimeoutMilliseconds = 3000;

//STRING CONSTANTS
const grantsPage_HeaderTagType = "h1";
const grantsPage_HeaderKeyText = "Agency Programs";
const youthParticipantsPage_HeaderTagType = "h1";
const youthParticipantsPage_HeaderKeyText = "AGENCY YOUTH";
const youthParticipantsNameAndDOBPage_HeaderTagType = "h1";
const youthParticipantsNameAndDOBPage_SFUSDHeaderKeyText = "REGISTER STUDENT FROM SFUSD";
const youthParticipantsNameAndDOBPage_NonSFUSDHeaderKeyText = "ADD NON-SFUSD STUDENT";
const youthParticipantsDetailedRegistrationPage_HeaderTagType = "h1";
const youthParticipantsDetailedRegistrationPage_HeaderKeyTextArray = ["YOUTH REGISTRATION (SFUSD)","YOUTH REGISTRATION (NON-SFUSD)"];
const youthParticipantsRegistrationPage_FormElementClassName = "validationArea";

const formFieldType_optionBoxes = "optionBoxes";
const formFieldType_dropDown = "dropDown";

//FORM NAME MAPPINGS - NAME AND DOB FORM
const formFieldMapping_nameAndDOBSFUSD = {
  "FirstName~0":"FirstName",
  "lastname~0":"LastName",
  "DOB~0":"Birthdate"
};
const formFieldMapping_nameAndDOBNonSFUSD = {
  "firstname~0":"FirstName",
  "lastname~0":"LastName",
  "DOB~0":"Birthdate"
};

//FORM NAME MAPPINGS - DETAILED REGISTRATION FORM
const formFieldMapping_detailedRegistration = {
  "HousingStatusSelect~0":"HousingStatus",
  "ZipSelect~0":"Zip",
  "language~0":"Language",
  "ethnicity~0":"Ethnicity",
  "gender~0":"Gender",
  "GayLesbianBisexual~0":"GayLesbianBisexual",
  "EducationalStatus1920~0":"Education"
};

//FORM LABEL MAPPINGS - DETAILED REGISTRATION FORM
const formLabelMapping_detailedRegistration = {
  "Housing Status":"HousingStatusSelect~0",
  "Zip":"ZipSelect~0",
  "Home Language":"language~0",
  "Race/Ethnicity":"ethnicity~0",
  "Gender":"gender~0",
  "Gay/Lesbian/Bisexual":"GayLesbianBisexual~0",
  "Educational Attainment":"EducationalStatus1920~0",
};

//FORM TYPE MAPPINGS - DETAILED REGISTRATION FORM
const formTypeMapping_detailedRegistration = {
  "HousingStatusSelect~0":formFieldType_dropDown,
  "ZipSelect~0":formFieldType_dropDown,
  "language~0":formFieldType_dropDown,
  "ethnicity~0":formFieldType_dropDown,
  "gender~0":formFieldType_optionBoxes,
  "GayLesbianBisexual~0":formFieldType_optionBoxes,
  "EducationalStatus1920~0":formFieldType_dropDown,
};

//FORM DEFAULT MAPPINGS - if no value is found in root object, then use these values
const formFieldDefaults_detailedRegistration = {
  "HousingStatusSelect~0":"Unknown",
  "ZipSelect~0":"Unknown",
  "language~0":"Unspecified",
  "ethnicity~0":"Declined to state",
  "gender~0":"Declined/Not Stated",
  "GayLesbianBisexual~0":"Unspecified",
  "EducationalStatus1920~0":"Declined/Not Stated",
};

//WORKER FUNCTIONS
const blWindowFramesExist = () => {return !!window && !!window.frames && !!window.frames.length > 0 && !!window.frames[0].document};
const getMainIFrameContent = () => {return window.frames[0].document;};
const getPageElementsByClassName = (className) => {return getMainIFrameContent().getElementsByClassName(className);};
const getPageElementById = (id) => {return getMainIFrameContent().getElementById(id);};
const convertHTMLCollectionToArray = (htmlCollection) => {return [].slice.call(htmlCollection);};
const getPageElementsByTagName = (tagName) => {return convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));};
const isOnGrantsPage = () => getPageElementsByTagName(grantsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(grantsPage_HeaderKeyText) > -1).length > 0;
const getParticipantsAndStaffPageLink = () => getPageElementsByTagName("span").filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(`Participants &amp; Staff`) > -1);
const getYouthLinks = () => getPageElementsByTagName("a").filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(`<span>Youth</span>`) > -1);
const isOnYouthParticipantsPage = () => {return getPageElementsByTagName(youthParticipantsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML === youthParticipantsPage_HeaderKeyText).length > 0;};
const isOnNameAndDOBNonSFUSDPage = () => {return getPageElementsByTagName(youthParticipantsNameAndDOBPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML === youthParticipantsNameAndDOBPage_NonSFUSDHeaderKeyText).length > 0;};
const isOnNameAndDOBSFUSDPage = () => {return getPageElementsByTagName(youthParticipantsNameAndDOBPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML === youthParticipantsNameAndDOBPage_SFUSDHeaderKeyText).length > 0;};
const isOnDetailedRegistrationPage = () => {return getPageElementsByTagName(youthParticipantsDetailedRegistrationPage_HeaderTagType).filter(item => !!item.innerHTML && (item.innerHTML === youthParticipantsDetailedRegistrationPage_HeaderKeyTextArray[0] || item.innerHTML === youthParticipantsDetailedRegistrationPage_HeaderKeyTextArray[1])).length > 0;};

const sendError = (errorMessage) => {
  const url = `${requestURL}/browser-log`
  try {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message:errorMessage,
        command,
        instanceDate,
        type:"error"
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
      if (err) sendError(err)
    }).catch((err) => {
      sendError("error sending result data request---1")
      sendError(err)
    })
  } catch (e) {
    sendError("error sending result data request---2")
    sendError(e)
  }
};

const addRequiredStudentNamingOverride = (message) => {
  requiredNameOverride.push(message);
};

const setInputTextBoxValue = (textBox,newValue) => {
  try {
    textBox.value = `${newValue}`.trim();
    return true;
  } catch(e) {
    sendError("error with setInputTextBoxValue");
    sendError(textBox);
    sendError(newValue);
    sendError(e);
  }
  return false;
};

const waitForDetailedRegistrationForm = (newParticipantRegistrations,intIndex) => {
  if (isOnDetailedRegistrationPage()) {
    convertHTMLCollectionToArray(getPageElementsByClassName(youthParticipantsRegistrationPage_FormElementClassName)).map((item) => {
      if (!!item.children) {
        if (item.children.length === 2) {
          const labels = item.children[0].getElementsByTagName("label");
          if (labels.length > 0) {
            if (!!labels[0].innerHTML) {
              const spanSplit = labels[0].innerHTML.split(`</span>`);
              if (spanSplit.length > 0) {
                const aSplit = spanSplit[spanSplit.length - 1].split(`<a`);
                if (aSplit.length > 0) {
                  const keyText = `${aSplit[0]}`.trim();
                  if (keyText.length > 0) {
                    if (!!formLabelMapping_detailedRegistration[keyText]) {
                      const matchingFormName = formLabelMapping_detailedRegistration[keyText];
                      if (!!formTypeMapping_detailedRegistration[matchingFormName]) {
                        const matchingFormType = formTypeMapping_detailedRegistration[matchingFormName];
                        let defaultValue = !!formFieldDefaults_detailedRegistration[matchingFormName] ? formFieldDefaults_detailedRegistration[matchingFormName] : null;
                        let specifiedValue = null;
                        if (!!formFieldMapping_detailedRegistration[matchingFormName]) {
                          if (!!newParticipantRegistrations[intIndex][formFieldMapping_detailedRegistration[matchingFormName]]) {
                            specifiedValue = newParticipantRegistrations[intIndex][formFieldMapping_detailedRegistration[matchingFormName]];
                          }
                        }
                        let blDefaultValueUsed, blSpecifiedValueUsed = false;
                        if (matchingFormType === formFieldType_optionBoxes) {
                          const matchingOptionLabels = convertHTMLCollectionToArray(getPageElementsByTagName("label"));
                          if (matchingOptionLabels.length > 0) {
                            const optionValues = convertHTMLCollectionToArray(matchingOptionLabels).map((item_2) => {
                              return item_2.innerHTML;
                            });
                            const optionIds = convertHTMLCollectionToArray(matchingOptionLabels).map((item_2) => {
                              return item_2.getAttribute("for");
                            });


                            if (!!specifiedValue) {
                              if (optionValues.indexOf(specifiedValue) > -1) {
                                blSpecifiedValueUsed = true;
                                getPageElementById(optionIds[optionValues.indexOf(specifiedValue)]).checked = true;
                              }
                            }
                            if (!blSpecifiedValueUsed) {
                              if (!!defaultValue) {
                                if (optionValues.indexOf(defaultValue) > -1) {
                                  blDefaultValueUsed = true;
                                  getPageElementById(optionIds[optionValues.indexOf(defaultValue)]).checked = true;
                                }
                              }
                            }
                            if (blSpecifiedValueUsed || blDefaultValueUsed) {
                              if (blSpecifiedValueUsed) {
                                sendLog(`SPECIFIED value (${specifiedValue}) for ${keyText} used for index ${intIndex} (${newParticipantRegistrations[intIndex].firstName_lastName})`);
                              } else {
                                sendLog(`DEFAULT value (${defaultValue}) for ${keyText} used for index ${intIndex} (${newParticipantRegistrations[intIndex].firstName_lastName})`);
                                if (!!specifiedValue) {
                                  sendError(`....error: SPECIFIED value (${specifiedValue}) NOT FOUND in option boxes for index ${intIndex} (${newParticipantRegistrations[intIndex].firstName_lastName})`);
                                }
                              }
                            } else {
                              sendError(`error: neither the default or specified value was found for ${keyText} for index ${intIndex} (${newParticipantRegistrations[intIndex].firstName_lastName})`);
                            }
                          }
                        }
                        if (matchingFormType === formFieldType_dropDown) {
                          const matchingSelectBoxes = item.children[1].children[0].children;
                          if (matchingSelectBoxes.length > 0) {
                            const optionValues = convertHTMLCollectionToArray(matchingSelectBoxes).map((item_2) => {
                              return !!item_2.innerHTML && item_2.innerHTML.trim().length > 0 ? item_2.innerHTML : null;
                            });
                            matchingSelectBoxes[0].parentNode.classList.remove("jcf-hidden");
                            if (!!specifiedValue) {
                              if (optionValues.indexOf(specifiedValue) > -1) {
                                blSpecifiedValueUsed = true;
                                matchingSelectBoxes[optionValues.indexOf(specifiedValue)].selected = true;
                              }
                            }
                            if (!blSpecifiedValueUsed) {
                              if (!!defaultValue) {
                                if (optionValues.indexOf(defaultValue) > -1) {
                                  blDefaultValueUsed = true;
                                  matchingSelectBoxes[optionValues.indexOf(defaultValue)].selected = true;
                                }
                              }
                            }
                            if (blSpecifiedValueUsed || blDefaultValueUsed) {
                              if (blSpecifiedValueUsed) {
                                sendLog(`SPECIFIED value (${specifiedValue}) for ${keyText} used for index ${intIndex} (${newParticipantRegistrations[intIndex].firstName_lastName})`);
                              } else {
                                sendLog(`DEFAULT value (${defaultValue}) for ${keyText} used for index ${intIndex} (${newParticipantRegistrations[intIndex].firstName_lastName})`);
                                if (!!specifiedValue) {
                                  sendError(`....error: SPECIFIED value (${specifiedValue}) NOT FOUND in drop down for index ${intIndex} (${newParticipantRegistrations[intIndex].firstName_lastName})`);
                                }
                              }
                            } else {
                              sendError(`error: neither the default or specified value was found for ${keyText} for index ${intIndex} (${newParticipantRegistrations[intIndex].firstName_lastName})`);
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    setTimeout(() => {
      sendLog(`saving index ${intIndex} of ${newParticipantRegistrations.length} (${newParticipantRegistrations[intIndex].firstName_lastName})`);
      top.DoLinkSubmit('ActionSubmit~Save; ');
      setTimeout(() => {
        sendLog("continuing to next participant registration");
        const pageContents = getPageElementById('PageContents');
        if (pageContents.innerHTML.indexOf(`ActionSubmit~PopJump`) > -1) {
          sendLog("clicking SUBMIT (non-SFUSD) save method found");
          top.DoLinkSubmit('ActionSubmit~PopJump;');
        } else {
          if (pageContents.innerHTML.indexOf(`ActionSubmit~Save`) > -1) {
            sendLog("clicking SUBMIT/SAVE (SFUSD) save method found");
            top.DoLinkSubmit('ActionSubmit~Save; PopJump; ');
            setTimeout(() => {
              sendLog("clicking back again for SFUSD registration to get back to main participants page");
              top.DoLinkSubmit('ActionSubmit~PopJump; ');
            }, pageTimeoutMilliseconds);
          } else {
            sendError(`unknown submit/save method on page for index ${intIndex} (${newParticipantRegistrations[intIndex].firstName_lastName}) - please navigate back to the main page manually`);
          }
        }
        waitForMainYouthParticipantsPage(newParticipantRegistrations, parseInt(intIndex) + 1);
      }, pageTimeoutMilliseconds);
    }, pageTimeoutMilliseconds);
  } else {
    setTimeout(() => {
      const matchingExistingRecordsMessage = getPageElementsByTagName(`h3`).find((elem) => !!elem.innerHTML && elem.innerHTML.indexOf('matching ') > -1 && elem.innerHTML.indexOf(' record(s) found at agency') > -1)
      const matchingViewRecordLink = getPageElementsByTagName(`a`).find((elem) => !!elem.innerHTML && elem.innerHTML.indexOf('View Record') > -1)
      if (!!matchingExistingRecordsMessage && !!matchingViewRecordLink) {
        sendError("matching registration already found - clicking view record")
        matchingViewRecordLink.click()
        setTimeout(() => {
          waitForDetailedRegistrationForm(newParticipantRegistrations, intIndex);
        },pageTimeoutMilliseconds*2)
      } else {
        sendLog("waiting for detailed registration form page to load....");
        waitForDetailedRegistrationForm(newParticipantRegistrations, intIndex);
      }
    }, pageTimeoutMilliseconds);
  }
};

const waitForMainYouthParticipantsPage = (newParticipantRegistrations,intIndex) => {
  if (isOnYouthParticipantsPage()) {
    sendLog(`new participant registrations for ${newParticipantRegistrations.length} participants : ${intIndex + 1 } of ${newParticipantRegistrations.length}`);
    enterParticipantRegistrationSFUSD(newParticipantRegistrations,intIndex);
  } else {
    setTimeout(() => {
      sendLog("waiting for main participants page to load....");
      waitForMainYouthParticipantsPage(newParticipantRegistrations, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const waitForNameAndDOBFormNonSFUSD = (newParticipantRegistrations,intIndex) => {
  if (isOnNameAndDOBNonSFUSDPage()) {
    let intCountOfFieldsPopulated = 0;
    convertHTMLCollectionToArray(getPageElementsByTagName("input")).map((item) => {
      const currentElementNameValue = item.getAttribute("name");
      if (!!formFieldMapping_nameAndDOBNonSFUSD[currentElementNameValue]) {
        if (!!newParticipantRegistrations[intIndex][formFieldMapping_nameAndDOBNonSFUSD[currentElementNameValue]]) {
          if (setInputTextBoxValue(item, newParticipantRegistrations[intIndex][formFieldMapping_nameAndDOBNonSFUSD[currentElementNameValue]])) {
            intCountOfFieldsPopulated += 1;
          } else {
            sendError("error: setting form was not found to be successful");
          }
        } else {
          sendError(`error: root object does not have the matching object node ${formFieldMapping_nameAndDOBNonSFUSD[currentElementNameValue]}`);
        }
      }
    });
    if (intCountOfFieldsPopulated === Object.keys(formFieldMapping_nameAndDOBNonSFUSD).length) {
      sendLog(`successfully populated all ${Object.keys(formFieldMapping_nameAndDOBNonSFUSD).length} fields for non-SFUSD initial registration`);
      top.DoLinkSubmit('ActionSubmit~Add;');
      waitForDetailedRegistrationForm(newParticipantRegistrations, intIndex);
    } else {
      sendError(`error: not all required fields have been set - ${Object.keys(formFieldMapping_nameAndDOBNonSFUSD).length} expected vs ${intCountOfFieldsPopulated} actual - canceling registration`);
      top.DoLinkSubmit('ActionSubmit~PopJump;');
      waitForMainYouthParticipantsPage(newParticipantRegistrations,parseInt(intIndex) + 1);
    }
  } else {
    setTimeout(() => {
      sendLog("waiting for name and date of birth form page to load for non-SFUSD student....");
      waitForNameAndDOBFormNonSFUSD(newParticipantRegistrations, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const waitForViewRecordLinkToAppear = (newParticipantRegistrations,intIndex) => {
  const pageContents = getPageElementById('PageContents');
  const blViewRecordLinkFound = pageContents.innerHTML.indexOf('View Record') > -1;
  if (blViewRecordLinkFound) {
    const tableRows = pageContents.getElementsByTagName("tr");
    const tableCells = tableRows[1].children;
    const registerOrViewRecordButton = tableCells[3].children[0];
    registerOrViewRecordButton.click();
    waitForDetailedRegistrationForm(newParticipantRegistrations,intIndex);
  } else {
    sendLog("waiting for view record link to appear...");
    setTimeout(() => {
      waitForViewRecordLinkToAppear(newParticipantRegistrations,intIndex);
    },pageTimeoutMilliseconds);
  }
};

const waitForSFUSDSearchResults = (newParticipantRegistrations,intIndex) => {
  try {
    const pageContents = getPageElementById('PageContents');
    const blNoResultsMessageFound = pageContents.innerHTML.indexOf('No matching records found') > -1;
    const blRegisterButtonFound = pageContents.innerHTML.indexOf('value="Register"') > -1;
    const blViewRecordLinkFound = pageContents.innerHTML.indexOf('View Record') > -1;
    if (blNoResultsMessageFound || blRegisterButtonFound || blViewRecordLinkFound) {
      sendLog("Search done");
      if (blNoResultsMessageFound) {
        sendError(`index ${intIndex} (${newParticipantRegistrations[intIndex].firstName_lastName}) not found in SFUSD - will perform non-SFUSD registration`);
        enterParticipantRegistrationNonSFUSD(newParticipantRegistrations, intIndex);
      } else {
        let blRegisterButtonClicked = false;
        sendLog(`> 0 results found for index ${intIndex} (${newParticipantRegistrations[intIndex].firstName_lastName})`);
        const tableRows = pageContents.getElementsByTagName("tr");
        if (tableRows.length === 2) { //first row is the TABLE HEADER
          const tableCells = tableRows[1].children;
          if (tableCells.length === 4) {
            let blExactNameFound = false;
            let blSimilarNameFound = false;
            if (tableCells[0].innerHTML.toLowerCase().trim() === newParticipantRegistrations[intIndex].firstName_lastName.toLowerCase().trim()) {
              blExactNameFound = true;
              blSimilarNameFound = true;
            } else {
              const pageNameSplit = tableCells[0].innerHTML.toLowerCase().trim().replace(",", " ").split(" ").map(item => item.trim()).filter(item => !!item && item.length > 0);
              const dbNameSplit = newParticipantRegistrations[intIndex].firstName_lastName.toLowerCase().trim().replace(",", " ").split(" ").map(item => item.trim());
              if (pageNameSplit.filter((item,index) => {
                return dbNameSplit.map((item_2,index_2) => {
                  return item_2.indexOf(item) > -1;
                }).length > 0;
              }).length === dbNameSplit.length) {
                blSimilarNameFound = true;
              }
            }
            if (blExactNameFound || blSimilarNameFound) {
              if (!blExactNameFound && blSimilarNameFound) {
                sendError(`ONE VERY SIMILAR DCFY record found for index ${intIndex} (${newParticipantRegistrations[intIndex].firstName_lastName}) - registration will continue but the naming override will need to be added for scripts to work as expected`);
                addRequiredStudentNamingOverride({
                  SFUSDSearchName: tableCells[0].innerHTML.toLowerCase().trim(),
                  SpreadSheetName: newParticipantRegistrations[intIndex].firstName_lastName.toLowerCase().trim()
                })
              }
              if (tableCells[1].innerHTML.toLowerCase().trim() === newParticipantRegistrations[intIndex].Birthdate.toLowerCase().trim()) {
                const registerOrViewRecordButton = tableCells[3].children[0];
                if (blRegisterButtonFound) {
                  sendLog("EXACTLY ONE SFUSD registration found - continuing");
                  blRegisterButtonClicked = true;
                  sendLog(`clicking registration for SFUSD found record`);
                  registerOrViewRecordButton.click();
                } else {
                  if (blViewRecordLinkFound) {
                    sendError(`existing record found in DCFY for index ${intIndex} (${newParticipantRegistrations[intIndex].firstName_lastName}) - skipping registration`);
                  } else {
                    sendError(`unknown search results state for index ${intIndex} (${newParticipantRegistrations[intIndex].firstName_lastName}) - skipping registration`);
                  }
                }
              } else {
                sendError(`search results returned a different birthday (${tableCells[1].innerHTML}) than expected for index ${intIndex} (${newParticipantRegistrations[intIndex].Birthdate}) - skipping registration`);
              }
            } else {
              sendError(`search results returned a different name (${tableCells[0].innerHTML}) than expected for index ${intIndex} (${newParticipantRegistrations[intIndex].firstName_lastName}) - skipping registration`);
            }
          } else {
            sendError(`expected four (4) cells in the results table but only found ${tableCells.length} for index ${intIndex} (${newParticipantRegistrations[intIndex].firstName_lastName}) - skipping registration`);
          }
        } else {
          sendError(`expecting one result but found ${tableRows.length - 1} for index ${intIndex} (${newParticipantRegistrations[intIndex].firstName_lastName}) - skipping registration`);
        }
        if (blRegisterButtonClicked) {
          waitForViewRecordLinkToAppear(newParticipantRegistrations, intIndex);
        } else {
          setTimeout(() => {
            top.DoLinkSubmit('ActionSubmit~PopJump; ');
            waitForMainYouthParticipantsPage(newParticipantRegistrations, parseInt(intIndex) + 1);
          }, pageTimeoutMilliseconds);
        }
      }
    } else {
      setTimeout(() => {
        sendLog("waiting for search results to load");
        waitForSFUSDSearchResults(newParticipantRegistrations, intIndex);
      }, pageTimeoutMilliseconds * 2);
    }
  } catch(e) {
    sendError("page load error - something may not be ready yet");
    sendError(e);
    setTimeout(() => {
      sendError("attempting page load again");
      waitForSFUSDSearchResults(newParticipantRegistrations, intIndex);
    }, pageTimeoutMilliseconds * 2);
  }
};

const waitForNameAndDOBFormSFUSD = (newParticipantRegistrations,intIndex) => {
  if (isOnNameAndDOBSFUSDPage()) {
    let intCountOfFieldsPopulated = 0;
    convertHTMLCollectionToArray(getPageElementsByTagName("input")).map((item) => {
      const currentElementNameValue = item.getAttribute("name");
          if (!!newParticipantRegistrations[intIndex][formFieldMapping_nameAndDOBSFUSD[currentElementNameValue]]) {
            if (setInputTextBoxValue(item, newParticipantRegistrations[intIndex][formFieldMapping_nameAndDOBSFUSD[currentElementNameValue]])) {
              intCountOfFieldsPopulated+=1;
            } else {
              sendError("error: setting form was not found to be successful");
            }
          } else {
            sendError(`error: root object does not have the matching object node ${formFieldMapping_nameAndDOBSFUSD[currentElementNameValue]}`);
          }
    });
    if (intCountOfFieldsPopulated === Object.keys(formFieldMapping_nameAndDOBSFUSD).length) {
      sendLog(`successfully populated all ${Object.keys(formFieldMapping_nameAndDOBSFUSD).length} fields for SFUSD Search`);
      top.DoLinkSubmit('ActionSubmit~Find; ');
      waitForSFUSDSearchResults(newParticipantRegistrations, intIndex);
    } else {
      sendError(`error: not all required fields have been set - ${Object.keys(formFieldMapping_nameAndDOBSFUSD).length} expected vs ${intCountOfFieldsPopulated} actual - canceling registration for index ${intIndex} (${newParticipantRegistrations[intIndex].firstName_lastName})`);
      top.DoLinkSubmit('ActionSubmit~PopJump;');
      waitForMainYouthParticipantsPage(newParticipantRegistrations,parseInt(intIndex) + 1);
    }
  } else {
    setTimeout(() => {
      sendLog("waiting for name and date of birth form page to load for SFUSD student....");
      waitForNameAndDOBFormSFUSD(newParticipantRegistrations, intIndex);
    }, pageTimeoutMilliseconds);
  }
};


const enterParticipantRegistrationNonSFUSD = (newParticipantRegistrations,intIndex) => {
  if (intIndex < newParticipantRegistrations.length) {
    top.DoLinkSubmit('ActionSubmit~Jump AddPerson.asp?PersonTypeID=32;');
    waitForNameAndDOBFormNonSFUSD(newParticipantRegistrations,intIndex);
  } else {
    sendLog(`no more registrations - done with all ${newParticipantRegistrations.length} new participant registrations.`);
    if (errorLog.length > 0) {
      sendError("SOME ERRORS WERE FOUND!");
      sendError(errorLog);
      sendError(JSON.stringify(errorLog));
    }
    window.close()
  }
};

const enterParticipantRegistrationSFUSD = (newParticipantRegistrations,intIndex) => {
  if (intIndex < newParticipantRegistrations.length) {
    setTimeout(() => {
      sendLog(`navigating to participant registration ${JSON.stringify(newParticipantRegistrations[intIndex])}- ${intIndex + 1} of ${newParticipantRegistrations.length}`);
      top.DoLinkSubmit('ActionSubmit~Jump AssignPerson.asp?PersonTypeID=32; ');
      waitForNameAndDOBFormSFUSD(newParticipantRegistrations, intIndex);
    },pageTimeoutMilliseconds)
  } else {
    sendLog(`no more registrations - done with all ${newParticipantRegistrations.length} new registrations.`);
    if (errorLog.length > 0) {
      sendError("SOME ERRORS WERE FOUND!");
      sendError(errorLog);
      sendError(JSON.stringify(errorLog));
    }
    if (requiredNameOverride.length > 0) {
      sendError("SOME OVERRIDE NAMES WERE FOUND!");
      sendError(requiredNameOverride);
      sendError(JSON.stringify(requiredNameOverride));
    }
    window.close()
  }
};

let errorLog = [];
let requiredNameOverride = [];

const waitForYouthParticipantsPageToLoad = () => {
  if (isOnYouthParticipantsPage()) {
    enterParticipantRegistrationSFUSD(newTeamScheduleParsed,0);
  } else {
    sendLog("waiting for youth participants page to load...");
    setTimeout(() => {
      waitForYouthParticipantsPageToLoad();
    },pageTimeoutMilliseconds);
  }
};
const waitForYouthLinkToAppear = () => {
  sendLog("checking if youth link is on the page...");
  const youthLinks = getYouthLinks();
  if (youthLinks.length > 0) {
    sendLog("youth link loaded... clicking on group youth participants page...");
    youthLinks[0].click();
    setTimeout(() => {
      waitForYouthParticipantsPageToLoad();
    },pageTimeoutMilliseconds);
  } else {
    sendLog("not yet on main district page...");
    setTimeout(() => {
      waitForMainDistrictPageToLoad();
    },pageTimeoutMilliseconds);
  }
};

const waitForMainDistrictPageToLoad = () => {
  sendLog("checking if on main district page...");
  const groupParticipantsAndStaffLinks = getParticipantsAndStaffPageLink();
  if (groupParticipantsAndStaffLinks.length > 0) {
    sendLog("main district page loaded... clicking on group participants page...");
    groupParticipantsAndStaffLinks[0].click();
    setTimeout(() => {
      waitForYouthLinkToAppear();
    },pageTimeoutMilliseconds);
  } else {
    sendLog("not yet on main district page...");
    setTimeout(() => {
      waitForMainDistrictPageToLoad();
    },pageTimeoutMilliseconds);
  }
};
const clickNewestGrantLink = () => {
  const availableGrants = convertHTMLCollectionToArray(getPageElementsByTagName("a")).filter((item) => item.innerHTML.trim().indexOf(`America SCORES Soccer Program`) > -1);
  const mostRecentGrant = availableGrants[availableGrants.length - 1];
  sendLog(`${availableGrants.length} grants found on page : clicking ${mostRecentGrant}`);
  mostRecentGrant.click();
  waitForMainDistrictPageToLoad();
};

const newTeamScheduleFromServer = "!REPLACE_DATABASE_DATA";
const newTeamScheduleParsed = JSON.parse(decodeURIComponent(newTeamScheduleFromServer)).map((item) => item.Birthdate_split && item.Birthdate_split.length === 3 ? {
      ...item,
      Birthdate:`${parseInt(item.Birthdate_split[1])}/${parseInt(item.Birthdate_split[2])}/${parseInt(item.Birthdate_split[0])}`
    } : item
);

const mainPageController = () => {
  if (blWindowFramesExist()) {
    if (isOnYouthParticipantsPage()) {
      enterParticipantRegistrationSFUSD(newTeamScheduleParsed,0);
    } else {
      sendLog(`not starting on participants page - attempting to navigate via grants page...`);
      if (isOnGrantsPage()) {
        clickNewestGrantLink();
      } else {
        sendLog(`waiting for grants page to load...`);
        setTimeout(() => {
          mainPageController();
        }, pageTimeoutMilliseconds);
      }
    }
  } else {
    sendLog(`waiting for window frames to load...`);
    setTimeout(() => {
      mainPageController();
    }, pageTimeoutMilliseconds);
  }
};


try {
  mainPageController();
} catch(e) {
  console.error("unknown error encountered")
  console.error(e)
  sendError(e)
}
