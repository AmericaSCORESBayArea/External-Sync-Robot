//README
//    after running, import the result into "district_2_registration_verify" collection after removing the existing documents.
// Time estimate: 30 minutes for 369 participants with 2000 ms page timeout

//wait at least this long before check page load status
const pageTimeoutMilliseconds = 2000;

//command
const command = `!REPLACE_COMMAND`

// callback server
const requestURL = '!REPLACE_API_SERVER'

// target collection
const resultsCollection = '!REPLACE_MONGO_COLLECTION'

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

const getCurrentPageIndex = () => {
  let currentPageIndex = -1;
  const pageNavigation = getPageElementsByClassName(youthParticipantsPage_PaginationClassName);
  if (pageNavigation.length > 0) {
    convertHTMLCollectionToArray(pageNavigation[0].children).map((item) => {
      if (!!item.className) {
        if (item.className === youthParticipantsPage_PaginationActiveClassName) {
          const navigationLinkElements = item.children;
          if (navigationLinkElements.length > 0) {
            if (!!navigationLinkElements[0].innerHTML) {
              if (!isNaN(parseInt(navigationLinkElements[0].innerHTML))) {
                currentPageIndex = parseInt(navigationLinkElements[0].innerHTML);
              }
            }
          }
        }
      }
    });
  }
  return currentPageIndex;
};

const getCurrentPageParticipants = () => {
  let pageElement_Names = [];
  getPageElementsByTagName(youthParticipantsPage_ParticipantTagType).map((item) => {
    if (!!item.innerHTML) {
      if (item.innerHTML.trim().length > 0) {
        const currentOnClick = item.getAttribute("onClick");
        if (!!currentOnClick) {
          if (currentOnClick.trim().length > 0) {
            if (currentOnClick.indexOf("top.DoLinkSubmit('ActionSubmit~push; jump PersonForm.asp?PersonID=") > -1) {
              const constParticipantIdSplit = currentOnClick.split("top.DoLinkSubmit('ActionSubmit~push; jump PersonForm.asp?PersonID=").join('').split(`'); return false;`);
              if (constParticipantIdSplit.length === 2) {
                if (!isNaN(parseInt(constParticipantIdSplit[0]))) {
                  pageElement_Names.push({
                    id:constParticipantIdSplit[0],
                    name: item.innerHTML
                  });
                }
              }
            }
          }
        }
      }
    }
    return null;
  }).filter(item => !!item);
  return pageElement_Names;
};

const waitForNextPageToLoad = (intNextPage,callback,participantIds) => {
  const currentPage = getCurrentPageIndex();
  if (currentPage === intNextPage) {
    callback(participantIds);
  } else {
    sendLog("waiting for next page to load....");
    setTimeout(() => {
      waitForNextPageToLoad(intNextPage,callback,participantIds);
    },pageTimeoutMilliseconds);
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

const waitForParticipantPageLoad = (participantIds,intIndex,participantFormData) => {
  if (isOnParticipantPage(participantIds[intIndex].id)) {
    sendLog(`participant page ${participantIds[intIndex].id} found`);

    const firstNameForm = 'FirstName~0';
    const lastNameForm = 'LastName~0';
    const dobForm = 'DOB~0';
    const zipForm = 'ZipSelect~0';
    const raceForm = 'childrace~0';
    const genderForm = 'Gender~0';
    const youthIsParentForm = 'youthparent~0';
    const activeStatusForm = 'ActiveStatus~0';

    const formNames = {
      [firstNameForm] :"First Name",
      [lastNameForm]:"Last Name",
      [dobForm]:"Date of Birth",
      [zipForm]:"Zip",
      [raceForm]:"Race/Ethnicity",
      [genderForm]:"Gender",
      [youthIsParentForm]:"Is Youth Also A Parent",
      [activeStatusForm]:"Status"
    };

    const formValues = Object.keys(formNames).map((item) => {
      let keyText = formNames[item];
      let keyValue = null;
      const pageElements = convertHTMLCollectionToArray(getPageElementsByName(item));
      let elementToUse = null;
      if (pageElements.length === 1) {
        elementToUse = pageElements[0];
      } else {
        const optionBoxElements = pageElements.filter((item_2) => {
          if (!!item_2.checked) {
            if (item_2.checked === true) {
              return item_2;
            }
          }
        });
        if (optionBoxElements.length === 1) {
          elementToUse = optionBoxElements[0];
        } else {
          sendError(`something not expected with ${item} field with participant ${participantIds[intIndex].id}`)
        }
      }
      if (!!elementToUse) {
        if (item === dobForm) {
          keyValue = `${elementToUse.value}`;
        }
        if ([zipForm,raceForm,genderForm].indexOf(item) > -1) {
          if (!!elementToUse.children) {
            convertHTMLCollectionToArray(elementToUse.children).map((item_2) => {
              const selectedTag = item_2.getAttribute("selected");
              if (!!selectedTag) {
                if (selectedTag === "selected") {
                  keyValue = item_2.innerHTML.trim();
                }
              }
            });
          }
        }
        if (item === youthIsParentForm) {
          if (`${elementToUse.value}` === `1`) {
            keyValue = "YES";
          } else {
            if (`${elementToUse.value}` === `2`) {
              keyValue = "NO";
            } else  {
              sendError(`unrecognized value ${elementToUse.value} with ${item} field with participant ${participantIds[intIndex].id}`);
            }
          }
        }
        if (item === activeStatusForm) {
          if (`${elementToUse.value}` === `1`) {
            keyValue = "Inactive";
          } else {
            if (`${elementToUse.value}` === `2`) {
              keyValue = "Active";
            } else  {
              sendError(`unrecognized value ${elementToUse.value} with ${item} field with participant ${participantIds[intIndex].id}`);
            }
          }
        }
      } else {
        sendError(`no matching elements found after validation for ${item} field with participant ${participantIds[intIndex].id}`);
      }
      return !!keyText && !!keyValue ? {
        k: keyText,
        v: keyValue
      } : null;
    }).filter(item => !!item);
    participantFormData.push({
      district:`district_2`,
      formValues:[
        ...formValues,
        {
          k:'Person ID',
          v:participantIds[intIndex].id
        }
      ],
      participant: participantIds[intIndex],
      browserDate:new Date().toISOString(),
      instanceDate
    });
    getParticipantsData(participantIds, parseInt(intIndex) + 1, participantFormData);
  } else {
    setTimeout(() => {
      sendLog("waiting for participant page to load....");
      waitForParticipantPageLoad(participantIds, intIndex, participantFormData);
    }, pageTimeoutMilliseconds);
  }
};

const sendResultData = (participantFormData) => {
  const url = `${requestURL}/browser-data`
  try {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        destinationMongoCollection: resultsCollection,
        destinationData: participantFormData
      })
    }).then((res, err) => {
      if (err) sendError(err)
      sendLog(`Request completed`);
      setTimeout(() => {
        sendLog("Closing window")
        window.close()
      }, pageTimeoutMilliseconds)
    }).catch((err) => {
      sendError("error sending result data request---1")
      sendError(err)
    })
  } catch (e) {
    sendError("error sending result data request---2")
    sendError(e)
  }
};

const getParticipantsData = (participantIds,intIndex,participantFormData) => {
  //MAIN LOGIC FOR GETTING PARTICIPANT DETAILS
  if (!participantFormData) {
    if (!Array.isArray(participantFormData)) {
      sendLog("initializing participantFormData");
      participantFormData=[];
    }
  }
  if (intIndex < participantIds.length) {
    sendLog(`navigating to participant details page ${participantIds[intIndex].id} (${intIndex + 1} of ${participantIds.length})`);
    top.DoLinkSubmit(`ActionSubmit~push; jump PersonForm.asp?PersonID=${participantIds[intIndex].id}`);
    waitForParticipantPageLoad(participantIds,intIndex,participantFormData);
  } else {
    sendLog("no participants remaining. done with getParticipantsData - running callback");
    sendResultData(participantFormData)
  }
};

const waitForYouthParticipantsPageToLoad = () => {
  if (isOnYouthParticipantsPage()) {
    gatherParticipantDetails();
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

const gatherParticipantDetails = (participantIds) => {
  if (!participantIds) {
    if (!Array.isArray(participantIds)) {
      participantIds=[];
    }
  }
  const foundParticipants = getCurrentPageParticipants();
  participantIds = [
    ...participantIds,
    ...foundParticipants,
  ];
  sendLog(`${foundParticipants.length} participants found on THIS page`);
  sendLog(`${participantIds.length} total participants found on ALL pages`);
  const nextButtons = getPageElementsByTagName("a").filter(item => !!item.innerHTML && item.innerHTML.indexOf("Next") > -1);
  if (nextButtons.length > 0) {
    sendLog("clicking next page...");
    nextButtons[0].click();
    setTimeout(() => {
      gatherParticipantDetails(participantIds);
    },pageTimeoutMilliseconds*2);
  } else {
    sendLog("no more participant data to gather - getting details for each");
    getParticipantsData(participantIds, 0);
  }
}

const mainPageController = () => {
  if (blWindowFramesExist()) {
    sendLog(`starting get existing participants...`);
    if (isOnYouthParticipantsPage()) {
      gatherParticipantDetails();
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
  mainPageController()
} catch(e) {
  console.error("unknown error encountered")
  console.error(e)
  sendError(e)
}
