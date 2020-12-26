//README
//    after running, import the result into "registration_verify" collection after removing the existing documents
// Time estimate: 27 minutes for 788 participants with 2000 ms page timeout
// Time estimate: 27 minutes for 788 participants with 1000 ms page timeout

// wait at least this long before check page load status
const pageTimeoutMilliseconds = 1000;

//STRING CONSTANTS
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
const getMainIFrameContent = () => {return window.frames[0].document;};
const getPageElementsByClassName = (className) => {return getMainIFrameContent().getElementsByClassName(className);};
const convertHTMLCollectionToArray = (htmlCollection) => {return [].slice.call(htmlCollection);};
const getPageElementsByTagName = (tagName) => {return convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));};

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
      console.error("cannot determine the current page page index");
    }
  }
  if (intNextPage > -1) {
    console.log(`navigating to next page ${intNextPage}`);
  } else {
    console.log("next page button not found - this may be the last page");
  }
  return intNextPage;
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
    console.log(`participant page ${participantIds[intIndex].id} found`);
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
      district:"district_1",
      formValues,
      participant: participantIds[intIndex],
      browserDate:new Date().toISOString(),
      instanceDate
    });
    console.log("new form data");
    console.log(formValues);
    console.log(JSON.stringify(formValues));
    getParticipantsData(participantIds, parseInt(intIndex) + 1, participantFormData);
  } else {
    setTimeout(() => {
      console.log("waiting for participant page to load....");
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
    if (participantIds[intIndex].status === "Complete") {
      console.log(`navigating to participant details page ${participantIds[intIndex].id} (${intIndex + 1} of ${participantIds.length})`);
      top.DoLinkSubmit(`ActionSubmit~push; jump PersonForm.asp?PersonID=${participantIds[intIndex].id}`);
      waitForParticipantPageLoad(participantIds,intIndex,participantFormData);
    } else {
      console.error(`skipping incomplete participant ${JSON.stringify(participantIds[intIndex])}`);
      participantFormData.push({
        exception:"not complete, manual check required",
        participant:participantIds[intIndex],
        browserDate:new Date().toISOString(),
        instanceDate
      });
      getParticipantsData(participantIds, parseInt(intIndex) + 1, participantFormData);
    }
  } else {
    console.log("no participants remaining. done with getParticipantsData");
    console.log(participantFormData);
    console.log(JSON.parse(participantFormData));
  }
};

const instanceDate = new Date().toISOString();

const mainPageController = (participantIds) => {
  //MAIN LOGIC FOR GETTING PARTICIPANT IDS
  if (!participantIds) {
    if (!Array.isArray(participantIds)) {
      console.log("initializing participantIds");
      participantIds=[];
    }
  }
  if (getPageElementsByTagName(youthParticipantsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML === youthParticipantsPage_HeaderKeyText).length > 0) {
    const foundParticipants = getCurrentPageParticipants();
    participantIds = [
      ...participantIds,
      ...foundParticipants,
    ];

    console.log(`${foundParticipants.length} participants found on THIS page`);
    console.log(`${participantIds.length} total participants found on ALL pages`);

    const intNextPage = navigateToNextPage();
    if (intNextPage > -1) {
      waitForNextPageToLoad(intNextPage,mainPageController,participantIds);
    } else {
      console.log(`navigation to next page not started - here are all of the ${participantIds.length} participant IDs:`);
      console.log(participantIds);
      console.log(JSON.stringify(participantIds));
      getParticipantsData(participantIds,0);
    }
  } else {
    console.error(`Not on the correct page. Please navigate to "Youth Participants Page" and run again when the page header is "${youthParticipantsPage_HeaderKeyText}"`);
  }
};