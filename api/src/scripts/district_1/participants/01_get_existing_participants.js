//README
//    after running, import the result into "registration_verify" collection after removing the existing documents
// Time estimate: 27 minutes for 788 participants with 2000 ms page timeout
// Time estimate: 27 minutes for 788 participants with 1000 ms page timeout

// wait at least this long before check page load status
const pageTimeoutMilliseconds = 1000;

//command
const command = `!REPLACE_COMMAND`

// callback server
const requestURL = '!REPLACE_API_SERVER'

// target collection
const resultsCollection = '!REPLACE_MONGO_COLLECTION'

//STRING CONSTANTS
const grantsPage_HeaderTagType = "h1";
const grantsPage_HeaderKeyText = "Agency Programs";
const youthParticipantsPage_HeaderTagType = "h1";
const youthParticipantsPage_HeaderKeyText = "AGENCY YOUTH";
const youthParticipantsPage_PaginationClassName = "pagination";
const youthParticipantsPage_PaginationActiveClassName = "active";
const youthParticipantsPage_PaginationNextAttributeName = "aria-label";
const youthParticipantsPage_PaginationNextKeyText = "Next";
const youthParticipantsPage_ParticipantTagType = "a";
const youthParticipantsPage_ParticipantPersonIdKeyText = "PersonID=";
const youthParticipantsPage_ParticipantPersonIdPostReplaceText = "'); return false;";
const youthParticipantsRegistrationPage_FormElementClassName = "validationArea";

//WORKER FUNCTIONS
const blWindowFramesExist = () => {return !!window && !!window.frames && !!window.frames.length > 0 && !!window.frames[0].document};
const getMainIFrameContent = () => {return window.frames[0].document;};
const getPageElementsByClassName = (className) => {return getMainIFrameContent().getElementsByClassName(className);};
const convertHTMLCollectionToArray = (htmlCollection) => {return [].slice.call(htmlCollection);};
const getPageElementsByTagName = (tagName) => {return convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));};
const isOnGrantsPage = () => getPageElementsByTagName(grantsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(grantsPage_HeaderKeyText) > -1).length > 0;
const getParticipantsAndStaffPageLink = () => getPageElementsByTagName("span").filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(`Participants &amp; Staff`) > -1);
const getYouthLinks = () => getPageElementsByTagName("a").filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(`<span>Youth</span>`) > -1);
const isOnYouthParticipantsPage = () => getPageElementsByTagName(youthParticipantsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML === youthParticipantsPage_HeaderKeyText).length > 0;

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

const constructParticipantIdInnerHTMLObject = (item,object) => {
  if (!!item.onclick) {
    const onClickText = item.getAttribute("onclick");
    if (onClickText.indexOf(youthParticipantsPage_ParticipantPersonIdKeyText) > -1) {
      const constParticipantIdSplit = onClickText.split(youthParticipantsPage_ParticipantPersonIdPostReplaceText).join('').split(youthParticipantsPage_ParticipantPersonIdKeyText);
      if (constParticipantIdSplit.length === 2) {
        if (!isNaN(parseInt(constParticipantIdSplit[1]))) {
          object[constParticipantIdSplit[1]] = item.innerHTML;
          return object
        }
      }
    }
  }
  return object;
};

const getCurrentPageParticipants = () => {
  let pageElement_Names = {};
  let pageElement_Statuses = {};

  getPageElementsByTagName(youthParticipantsPage_ParticipantTagType).map((item) => {
    if (!!item.innerHTML) {
      if (item.innerHTML !== "Complete" && item.innerHTML !== "Finish Registration") {
        pageElement_Names = constructParticipantIdInnerHTMLObject(item,pageElement_Names);
      }
    }
    return null;
  }).filter(item => !!item);
  getPageElementsByTagName(youthParticipantsPage_ParticipantTagType).map((item) => {
    if (!!item.innerHTML) {
      if (item.innerHTML === "Complete" || item.innerHTML === "Finish Registration") {
        pageElement_Statuses = constructParticipantIdInnerHTMLObject(item,pageElement_Statuses);
      }
    }
    return null;
  }).filter(item => !!item);
  return Object.keys(pageElement_Names).map((item) => {
    return !!pageElement_Names[item] && !!pageElement_Statuses[item] ? {
      id: item,
      name: pageElement_Names[item],
      status: pageElement_Statuses[item]
    } : null;
  }).filter(item => !!item);
};

const navigateToNextPage = () => {
  let intNextPage = -1;
  const currentPageIndex = getCurrentPageIndex();
  if (currentPageIndex > 0) {
    const pageNavigation = getPageElementsByClassName(youthParticipantsPage_PaginationClassName);
    if (pageNavigation.length > 0) {
      convertHTMLCollectionToArray(pageNavigation[0].children).map((item) => {
        if (!!item.children) {
          convertHTMLCollectionToArray(item.children).map((item_2) => {
            if (item_2.getAttribute(youthParticipantsPage_PaginationNextAttributeName) === youthParticipantsPage_PaginationNextKeyText) {
              intNextPage = currentPageIndex + 1;
              item_2.click();
            }
          });
        }
      });
    } else {
      sendError("cannot determine the current page page index");
    }
  }
  if (intNextPage > -1) {
    sendLog(`navigating to next page ${intNextPage}`);
  } else {
    sendLog("next page button not found - this may be the last page");
  }
  return intNextPage;
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
  return convertHTMLCollectionToArray(getPageElementsByClassName("form-item-text")).filter((item) => {
    if (!!item.innerHTML) {
      if (`${item.innerHTML}` === `${participantId}`) {
        return true;
      }
    }
    return false
  }).length > 0;
};


const waitForParticipantPageLoad = (participantIds,intIndex,participantFormData) => {
  if (isOnParticipantPage(participantIds[intIndex].id)) {
    sendLog(`participant page ${participantIds[intIndex].id} found`);
    const formValues = convertHTMLCollectionToArray(getPageElementsByClassName(youthParticipantsRegistrationPage_FormElementClassName)).map((item) => {
      let keyText = null;
      let keyValue = null;
      if (!!item.children) {
        if (item.children.length === 2) {
          const labels = item.children[0].getElementsByTagName("label");
          if (labels.length > 0) {
            if (!!labels[0].innerHTML) {
              const spanSplit = labels[0].innerHTML.split(`</span>`);
              if (spanSplit.length > 0) {
                const aSplit = spanSplit[spanSplit.length - 1].split(`<a`);
                if (aSplit.length > 0) {
                  keyText = `${aSplit[0]}`.trim();
                  if (keyText.length > 0) {

                    const matchingTextLabels = item.children[1].getElementsByClassName("form-item-text");
                    const matchingSelectBoxes = item.children[1].getElementsByClassName("jcf-select-text");
                    const matchingInputsBoxes = item.children[1].getElementsByTagName("input");
                    const matchingRadioBoxes = item.children[1].getElementsByClassName("radio-row");

                    if (matchingTextLabels.length > 0) {
                      keyValue = matchingTextLabels[0].innerHTML;
                    } else {
                      if (matchingSelectBoxes.length > 0) {
                        if (!!matchingSelectBoxes[0].children) {
                          keyValue = matchingSelectBoxes[0].children[0].innerHTML;
                        }
                      } else {
                        if (matchingRadioBoxes.length > 0) {
                          const activeRadioBoxes = matchingRadioBoxes[0].getElementsByClassName('jcf-label-active');
                          if (activeRadioBoxes.length > 0) {
                            keyValue = activeRadioBoxes[0].innerHTML;
                          }
                        } else {
                          if (matchingInputsBoxes.length > 0) {
                            keyValue = matchingInputsBoxes[0].value;
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
      return !!keyText && !!keyValue ? {
        k: keyText,
        v: keyValue
      } : null;
    }).filter(item => !!item);
    participantFormData.push({
      district: "district_1",
      formValues,
      participant: participantIds[intIndex],
      browserDate: new Date().toISOString(),
      instanceDate
    });
    sendLog(`new form data for index : ${intIndex} (${JSON.stringify(participantIds[intIndex])})`);
    getParticipantsData(participantIds, parseInt(intIndex) + 1, participantFormData);
  } else {
    setTimeout(() => {
      sendLog("waiting for participant page to load....");
      waitForParticipantPageLoad(participantIds, intIndex, participantFormData);
    }, pageTimeoutMilliseconds);
  }
};

const closeWindow = () => {
  sendLog("Closing window")
  setTimeout(() => {
    window.close()
  }, pageTimeoutMilliseconds)
}

const sendResultData = (participantFormData) => {
  const url = `${requestURL}/browser-data`
  sendLog(`Sending Data to API : ${url}`);
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
      participantFormData = [];
    }
  }
  if (intIndex < participantIds.length) {
    if (participantIds[intIndex].status === "Complete") {
      sendLog(`navigating to participant details page ${participantIds[intIndex].id} (${intIndex + 1} of ${participantIds.length})`);
      top.DoLinkSubmit(`ActionSubmit~push; jump PersonForm.asp?PersonID=${participantIds[intIndex].id}`);
      waitForParticipantPageLoad(participantIds, intIndex, participantFormData);
    } else {
      sendError(`skipping incomplete participant ${JSON.stringify(participantIds[intIndex])}`);
      // participantFormData.push();

      sendResultData({
          exception: "not complete, manual check required",
          participant: participantIds[intIndex],
          browserDate: new Date().toISOString(),
          instanceDate
        })

      getParticipantsData(participantIds, parseInt(intIndex) + 1, participantFormData);
    }
  } else {
    sendLog("no participants remaining. done with getParticipantsData - running callback");
    closeWindow();
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

const instanceDate = new Date().toISOString();

const gatherParticipantDetails = (participantIds) => {
  if (!participantIds) {
    if (!Array.isArray(participantIds)) {
      sendLog("initializing participantIds");
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
  const intNextPage = navigateToNextPage();
  if (intNextPage > -1) {
    waitForNextPageToLoad(intNextPage,gatherParticipantDetails,participantIds);
  } else {
    sendLog(`gathering participant data for ${participantIds.length} participant IDs:`);
    getParticipantsData(participantIds,0);
  }
};

const mainPageController = () => {
  if (blWindowFramesExist()) {
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
  mainPageController();
} catch(e) {
  console.error("unknown error encountered")
  console.error(e)
  sendError(e)
}
