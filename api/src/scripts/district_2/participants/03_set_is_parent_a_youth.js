//wait at least this long before check page load status
const pageTimeoutMilliseconds = 3000;

//command
const command = `!REPLACE_COMMAND`

// callback server
const requestURL = '!REPLACE_API_SERVER'

// target collection
const resultsCollection = '!REPLACE_MONGO_COLLECTION'

//wait at least this long bef

//STRING CONSTANTS
const grantsPage_HeaderTagType = "span";
const grantsPage_HeaderKeyText = "GRANT LIST";
const youthParticipantsPage_HeaderTagType = "td";
const youthParticipantsSearchPage_HeaderKeyText = "PARTICIPANTS &amp; STAFF";
const youthParticipantsPage_HeaderKeyText = "YOUTH PARTICIPANTS (";
const youthParticipantsPage_PaginationClassName = "pagination";
const youthParticipantsPage_PaginationActiveClassName = "active";
const youthParticipantsPage_ParticipantTagType = "a";

//WORKER FUNCTIONS
const blWindowFramesExist = () => {return !!window && !!window.frames && !!window.frames.length > 0 && !!window.frames[0].document};
const getMainIFrameContent = () => {return window.frames[0].document;};
const getPageElementsByClassName = (className) => {return getMainIFrameContent().getElementsByClassName(className);};
const getPageElementsByName = (name) => {return getMainIFrameContent().getElementsByName(name);};
const convertHTMLCollectionToArray = (htmlCollection) => {return [].slice.call(htmlCollection);};
const getPageElementsByTagName = (tagName) => {return convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));};

const isOnMainParticipantsSearchPage = () => getPageElementsByTagName(youthParticipantsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.indexOf(youthParticipantsSearchPage_HeaderKeyText) > -1).length > 0;
const isOnYouthParticipantsPage = () => getPageElementsByTagName(youthParticipantsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.indexOf(youthParticipantsPage_HeaderKeyText) > -1).length > 0;
const isOnGrantsPage = () => {return getPageElementsByTagName(grantsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(grantsPage_HeaderKeyText) > -1).length > 0;};
const getParticipantsAndStaffPageLink = () => getPageElementsByTagName("a").filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(`Participants &amp; Staff`) > -1);
const getYouthParticipantsPageLinks = () => getPageElementsByTagName("li").filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(`View Youth Participants`) > -1);

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


const setParticipantIsAParent = (participantData,intIndex,participantFormData) => {
  if (intIndex < participantData.length) {
    setTimeout(() => {
      sendLog(`attempting set participant is a parent for participant ${participantData[intIndex].participant.id} ${intIndex + 1} of ${participantData.length}`);
      top.DoLinkSubmit(`ActionSubmit~push; jump PersonForm.asp?PersonID=${participantData[intIndex].participant.id}`);
      waitForParticipantPageLoad(participantData, intIndex,participantFormData, 0);
    },pageTimeoutMilliseconds);
  } else {
    sendLog(`no more participants - done with all ${participantData.length} new participant is a parent.`);
    if (errorLog.length > 0) {
      sendError("SOME ERRORS WERE FOUND!");
      sendError(errorLog);
      sendError(JSON.stringify(errorLog));
    }
    window.close()
  }
};

const waitForParticipantPageLoad = (participantData,intIndex,participantFormData,intRetryCount) => {
  setTimeout(() => {
    if (isOnParticipantPage(participantData[intIndex].participant.id)) {
      sendLog(`participant page ${participantData[intIndex].participant.id} found`);
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
      setTimeout(() => {
        if (blCheckedChanged) {
          sendLog("set to 'NO' - saving...");
          top.DoLinkSubmit('ActionSubmit~Save; ');
          setTimeout(() => {
            sendLog("navigating to next participant");
            setParticipantIsAParent(participantData, parseInt(intIndex) + 1, participantFormData);
          }, pageTimeoutMilliseconds)
        } else {
          sendError(`${youthIsParentForm} not set as expected for ${participantData[intIndex]}`);
        }
      }, pageTimeoutMilliseconds);
    } else {
      setTimeout(() => {
        if (intRetryCount < 3) {
          sendLog(`waiting for participant page ${participantData[intIndex].participant.id} to load....`);
          waitForParticipantPageLoad(participantData, intIndex, participantFormData, intRetryCount + 1);
        } else {
          sendLog(`...retry count waitForParticipantPageLoad exceeded - running the navigate command again`)
          const buttons = convertHTMLCollectionToArray(getPageElementsByTagName("input"));
          buttons.map((item) => {
            const currentButtonValue = item.getAttribute("value");
            if (!!currentButtonValue) {
              if (currentButtonValue === "Cancel") {
                sendLog("clicking cancel...");
                item.click();
              }
            }
          });
          setTimeout(() => {
            navigateToParticipantPage(participantData, intIndex, participantFormData)
          }, pageTimeoutMilliseconds);
        }
      }, pageTimeoutMilliseconds);
    }
  },pageTimeoutMilliseconds);
};

const navigateToParticipantPage = (participantData,intIndex,participantFormData) => {
  sendLog(`navigating to participant details page ${participantData[intIndex].participant.id} (${intIndex + 1} of ${participantData.length})`);
  top.DoLinkSubmit(`ActionSubmit~push; jump PersonForm.asp?PersonID=${participantData[intIndex].participant.id}`);
  waitForParticipantPageLoad(participantData, intIndex, participantFormData, 0);
};

const setParticipantsData = (participantData,intIndex,participantFormData) => {
  if (!participantFormData) {
    if (!Array.isArray(participantFormData)) {
      sendLog("initializing participantFormData");
      participantFormData=[];
    }
  }
  if (intIndex < participantData.length) {
    navigateToParticipantPage(participantData,intIndex,participantFormData)
  } else {
    sendLog("no participants remaining. done with getParticipantsData - running callback");
    window.close()
  }
};

const waitForYouthParticipantsPageToLoad = () => {
  if (isOnYouthParticipantsPage()) {
    setParticipantsData(participantsDataParsed, 0);
  } else {
    sendLog("waiting for youth participants page to load...");
    setTimeout(() => {
      waitForYouthParticipantsPageToLoad();
    },pageTimeoutMilliseconds);
  }
};

const waitForMainParticipantsSearchPageToLoad = () => {
  if (isOnMainParticipantsSearchPage()) {
    const youthParticipantsLinks = getYouthParticipantsPageLinks();
    if (youthParticipantsLinks.length > 0) {
      sendLog("clicking youth participants link...");
      youthParticipantsLinks[0].click();
      waitForYouthParticipantsPageToLoad();
    } else {
      sendError("cannot find any youth participants links - please check...");
    }
  } else {
    sendLog("waiting for main participants search page to load...");
    setTimeout(() => {
      waitForMainParticipantsSearchPageToLoad();
    },pageTimeoutMilliseconds);
  }
};

const waitForMainDistrictPageToLoad = () => {
  sendLog("checking if on main district page...");
  const groupParticipantsAndStaffLinks = getParticipantsAndStaffPageLink();
  if (groupParticipantsAndStaffLinks.length > 0) {
    sendLog("main district page loaded... clicking on group participants page...");
    groupParticipantsAndStaffLinks[0].click();
    waitForMainParticipantsSearchPageToLoad();
  } else {
    sendLog("not yet on main district page...");
    setTimeout(() => {
      waitForMainDistrictPageToLoad();
    },pageTimeoutMilliseconds);
  }
};

const clickNewestGrantLink = () => {
  const availableGrants = convertHTMLCollectionToArray(getPageElementsByClassName("contract")).filter((item) => !!item.getAttribute("href"));
  const mostRecentGrant = availableGrants[availableGrants.length - 1];
  sendLog(`${availableGrants.length} grants found on page : clicking ${mostRecentGrant}`);
  mostRecentGrant.click();
  waitForMainDistrictPageToLoad();
};

const instanceDate = new Date().toISOString();

let errorLog = [];

const participantsDataFromServer = "!REPLACE_DATABASE_DATA";
const participantsDataParsed = JSON.parse(decodeURIComponent(participantsDataFromServer))

const mainPageController = () => {
  if (blWindowFramesExist()) {
    sendLog(`starting set "Is youth also a parent?" on existing participants...`);
    if (isOnYouthParticipantsPage()) {
      setParticipantsData(participantsDataParsed, 0);
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

mainPageController();