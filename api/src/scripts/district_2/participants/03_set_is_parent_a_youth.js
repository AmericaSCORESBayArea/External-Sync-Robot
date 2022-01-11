//initializing callback that will run with out data
let callback_main = null;

//wait at least this long before check page load status
const pageTimeoutMilliseconds = 2000;

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


const addError = (message) => {
  console.error(message);
  errorLog.push(message);
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
    console.log("waiting for next page to load....");
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


const setParticipantIsAParent = (participantIds,intIndex) => {
  if (intIndex < participantIds.length) {
    setTimeout(() => {
      console.log(`attempting set participant is a parent for participant ${participantIds[intIndex].id} ${intIndex + 1} of ${participantIds.length}`);
      top.DoLinkSubmit(`ActionSubmit~push; jump PersonForm.asp?PersonID=${participantIds[intIndex].id}`);
      waitForParticipantPageLoad(participantIds, intIndex);
    },pageTimeoutMilliseconds);
  } else {
    console.log(`no more participants - done with all ${participantIds.length} new participant is a parent.`);
    if (errorLog.length > 0) {
      console.error("SOME ERRORS WERE FOUND!");
      console.error(errorLog);
      console.error(JSON.stringify(errorLog));
    }
    callback_main(errorLog);
  }
};

const waitForParticipantPageLoad = (participantIds,intIndex,participantFormData) => {
  if (isOnParticipantPage(participantIds[intIndex].id)) {
    console.log(`participant page ${participantIds[intIndex].id} found`);
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
        console.log("set to 'NO' - saving...");
        top.DoLinkSubmit('ActionSubmit~Save; ');
        setTimeout(() => {
          console.log("navigating to next participant");
          setParticipantIsAParent(participantIds,parseInt(intIndex) + 1);
        },pageTimeoutMilliseconds)
      } else {
        addError(`${youthIsParentForm} not set as expected for ${participantIds[intIndex]}`);
      }
    },pageTimeoutMilliseconds);
  } else {
    setTimeout(() => {
      console.log(`waiting for participant page ${participantIds[intIndex].id} to load....`);
      waitForParticipantPageLoad(participantIds, intIndex, participantFormData);
    }, pageTimeoutMilliseconds);
  }
};

const getParticipantsData = (participantIds,intIndex,participantFormData) => {
  //MAIN LOGIC FOR GETTING PARTICIPANT DETAILS
  if (!participantFormData) {
    if (!Array.isArray(participantFormData)) {
      console.log("initializing participantFormData");
      participantFormData=[];
    }
  }
  if (intIndex < participantIds.length) {
    console.log(`navigating to participant details page ${participantIds[intIndex].id} (${intIndex + 1} of ${participantIds.length})`);
    top.DoLinkSubmit(`ActionSubmit~push; jump PersonForm.asp?PersonID=${participantIds[intIndex].id}`);
    waitForParticipantPageLoad(participantIds,intIndex,participantFormData);
  } else {
    console.log("no participants remaining. done with getParticipantsData - running callback");
    callback_main(participantFormData);
  }
};

const waitForYouthParticipantsPageToLoad = () => {
  if (isOnYouthParticipantsPage()) {
    gatherParticipantDetails();
  } else {
    console.log("waiting for youth participants page to load...");
    setTimeout(() => {
      waitForYouthParticipantsPageToLoad();
    },pageTimeoutMilliseconds);
  }
};

const waitForMainParticipantsSearchPageToLoad = () => {
  if (isOnMainParticipantsSearchPage()) {
    const youthParticipantsLinks = getYouthParticipantsPageLinks();
    if (youthParticipantsLinks.length > 0) {
      console.log("clicking youth participants link...");
      youthParticipantsLinks[0].click();
      waitForYouthParticipantsPageToLoad();
    } else {
      console.error("cannot find any youth participants links - please check...");
    }
  } else {
    console.log("waiting for main participants search page to load...");
    setTimeout(() => {
      waitForMainParticipantsSearchPageToLoad();
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
  console.log(`${foundParticipants.length} participants found on THIS page`);
  console.log(`${participantIds.length} total participants found on ALL pages`);
  const nextButtons = getPageElementsByTagName("a").filter(item => !!item.innerHTML && item.innerHTML.indexOf("Next") > -1);
  if (nextButtons.length > 0) {
    console.log("clicking next page...");
    nextButtons[0].click();
    setTimeout(() => {
      gatherParticipantDetails(participantIds);
    },pageTimeoutMilliseconds*2);
  } else {
    console.log("no more participant data to gather - getting details for each");
    getParticipantsData(participantIds, 0);
  }
}

const mainPageController = () => {
  callback_main = arguments[arguments.length - 1];  //setting callback from the passed implicit arguments sourced in selenium executeAsyncScript()
  if (blWindowFramesExist()) {
    console.log(`starting set "Is youth also a parent?" on existing participants...`);
    if (isOnYouthParticipantsPage()) {
      gatherParticipantDetails();
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