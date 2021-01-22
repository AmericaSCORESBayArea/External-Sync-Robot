//README
//    after running, import the result into "district_2_registration_verify" collection after removing the existing documents.
// Time estimate: 30 minutes for 369 participants with 2000 ms page timeout

//wait at least this long before check page load status
const pageTimeoutMilliseconds = 2000;

//STRING CONSTANTS
const youthParticipantsPage_HeaderTagType = "td";
const youthParticipantsPage_HeaderKeyText = "YOUTH PARTICIPANTS (";
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
const getPageElementsByName = (name) => {return getMainIFrameContent().getElementsByName(name);};
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

const waitForParticipantPageLoad = (participantIds,intIndex,participantFormData) => {
  if (isOnParticipantPage(participantIds[intIndex].id)) {
    console.log(`participant page ${participantIds[intIndex].id} found`);

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
          addError(`something not expected with ${item} field with participant ${participantIds[intIndex].id}`)
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
              addError(`unrecognized value ${elementToUse.value} with ${item} field with participant ${participantIds[intIndex].id}`);
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
              addError(`unrecognized value ${elementToUse.value} with ${item} field with participant ${participantIds[intIndex].id}`);
            }
          }
        }
      } else {
        addError(`no matching elements found after validation for ${item} field with participant ${participantIds[intIndex].id}`);
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
    console.log(`navigating to participant details page ${participantIds[intIndex].id} (${intIndex + 1} of ${participantIds.length})`);
    top.DoLinkSubmit(`ActionSubmit~push; jump PersonForm.asp?PersonID=${participantIds[intIndex].id}`);
    waitForParticipantPageLoad(participantIds,intIndex,participantFormData);
  } else {
    console.log("no participants remaining. done with getParticipantsData");
    console.log(participantFormData);
    console.log(JSON.parse(participantFormData));
    console.log(`END TIME: ${new Date()}`);
  }
};

const instanceDate = new Date().toISOString();

let errorLog = [];

const mainPageController = (participantIds) => {
  //MAIN LOGIC FOR GETTING PARTICIPANT IDS
  if (!participantIds) {
    if (!Array.isArray(participantIds)) {
      console.log(`START TIME: ${new Date()}`);
      console.log("initializing participantIds");
      participantIds=[];
    }
  }
  if (getPageElementsByTagName(youthParticipantsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.indexOf(youthParticipantsPage_HeaderKeyText) > -1).length > 0) {
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
        mainPageController(participantIds);
      },pageTimeoutMilliseconds*2);
    } else {
      console.log("no more participant data to gather - getting details for each");
      getParticipantsData(participantIds, 0);
    }
  } else {
    console.error(`Not on the correct page. Please navigate to "Youth Participants Page" and run again when the page header starts with "${youthParticipantsPage_HeaderKeyText}"`);
  }
};