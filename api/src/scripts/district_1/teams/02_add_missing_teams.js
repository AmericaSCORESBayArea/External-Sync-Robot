//README
//    use the view: "team_missing_team_with_found_school_mapping" as input
//    afterwards, need to rerun the script "01_get_existing_teams_and_schedule.js"
// Time estimate:

//wait at least this long before check page load status
const pageTimeoutMilliseconds = 3000;

//initializing callback that will run with out data
let callback_main = null;

//STRING CONSTANTS
const grantsPage_HeaderTagType = "h1";
const grantsPage_HeaderKeyText = "Agency Programs";
const activitiesPage_HeaderTagType = "h1";
const activitiesPage_HeaderKeyText = "ACTIVITIES";
const activitiesPageDefineActivity_HeaderTagType = "h1";
const activitiesPageDefineActivity_HeaderKeyText = "DEFINE ACTIVITY";
const activitiesPageDefineLabelAndSite_HeaderTagType = "label";
const activitiesPageDefineLabelAndSite_SFUSDHeaderKeyText = "Activity Description";
const schedulePage_HeaderTagType = "h1";
const schedulePage_HeaderKeyText = "CREATE SCHEDULE";

//WORKER FUNCTIONS
const blWindowFramesExist = () => {return !!window && !!window.frames && !!window.frames.length > 0 && !!window.frames[0].document};
const getMainIFrameContent = () => {return window.frames[0].document;};
const convertHTMLCollectionToArray = (htmlCollection) => {return [].slice.call(htmlCollection);};
const getPageElementsByTagName = (tagName) => {return convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));};
const isOnActivitiesPage = () => {return getPageElementsByTagName(activitiesPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(activitiesPage_HeaderKeyText) === 0).length > 0;};
const isOnDefineActivityTypePage = () => {return getPageElementsByTagName(activitiesPageDefineActivity_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML === activitiesPageDefineActivity_HeaderKeyText).length > 0;};
const isOnDefineActivityLabelAndSitePage = () => {return getPageElementsByTagName(activitiesPageDefineLabelAndSite_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML === activitiesPageDefineLabelAndSite_SFUSDHeaderKeyText).length > 0;};
const isOnSchedulePage = () => {return getPageElementsByTagName(schedulePage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML === schedulePage_HeaderKeyText).length > 0;};
const isOnGrantsPage = () => getPageElementsByTagName(grantsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(grantsPage_HeaderKeyText) > -1).length > 0;
const getActivitiesPageLink = () => getPageElementsByTagName("span").filter(item => !!item.innerHTML && item.innerHTML.trim() === `Activities`);

const addError = (message) => {
  console.error(message);
  errorLog.push(message);
};

const waitForDefineActivityLabelAndSiteForm = (newTeamRegistrations,intIndex) => {
  if (isOnDefineActivityLabelAndSitePage()) {
    let blKeyValueFound = false;
    convertHTMLCollectionToArray(getPageElementsByTagName("select")).map((item) => {
      const currentElementNameValue = item.getAttribute("name");
      if (currentElementNameValue === 'GMS_ServiceSiteID') {
        const matchingSelectBoxes = item.children;
        if (matchingSelectBoxes.length > 0) {
          const optionValues = convertHTMLCollectionToArray(matchingSelectBoxes).map((item_2) => {
            return !!item_2.innerHTML && item_2.innerHTML.trim().length > 0 ? item_2.innerHTML.trim() : null;
          });
          item.classList.remove("jcf-hidden");
          if (optionValues.indexOf(newTeamRegistrations[intIndex].school) > -1) {
            blKeyValueFound = true;
            matchingSelectBoxes[optionValues.indexOf(newTeamRegistrations[intIndex].school)].selected = true;
          }
        } else {
          addError(`error: the required school drop down value not found (${newTeamRegistrations[intIndex].school}) - cannot continue`);
          callback_main(errorLog)
          window.close()
        }
      }
    });
    if (blKeyValueFound) {
      console.log(`School Value (${newTeamRegistrations[intIndex].school}) found`);
      let activityNameFound = false;
      convertHTMLCollectionToArray(getPageElementsByTagName("input")).map((item) => {
        const currentElementNameValue = item.getAttribute("name");
        if (currentElementNameValue === "ServiceName~0") {
          item.value = newTeamRegistrations[intIndex]._id;
          activityNameFound = true;
        }
      });
      if (activityNameFound) {
        console.log(`the team name was entered successfully (${newTeamRegistrations[intIndex]._id}) - continuing`);
        top.DoLinkSubmit('ActionSubmit~Save; PushServiceFormPage; PushStaffPage_SpecifyStaff; PushSchedulePage; PopJump; ');
        waitForScheduleForm(newTeamRegistrations, intIndex);
      } else {
        addError(`error: cannot find the service name input field (ServiceName~0) - cannot continue`);
        callback_main(errorLog)
        window.close()
      }
    }
  } else {
    setTimeout(() => {
      console.log("waiting for define activity label and school form page to load...");
      waitForDefineActivityLabelAndSiteForm(newTeamRegistrations, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const waitForScheduleForm = (newTeamRegistrations,intIndex) => {
  if (isOnSchedulePage()) {
    console.log("schedule form loaded");
    console.log("skipping the schedule creation for a separate step");
    top.DoLinkSubmit('ActionSubmit~PopJump; ');
    setTimeout(() => {
      console.log("returning to main page to continue to the next team registration");
      top.DoLinkSubmit('ActionSubmit~PopJump; ');
      createNewTeamNames(newTeamRegistrations,parseInt(intIndex) + 1);
    }, pageTimeoutMilliseconds);
  } else {
    setTimeout(() => {
      console.log("waiting for schedule form page to load...");
      waitForScheduleForm(newTeamRegistrations, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const waitForDefineActivityTypeForm = (newTeamRegistrations,intIndex) => {
  const keyMatchingText = "SCORES&nbsp;-&nbsp;Group";
  if (isOnDefineActivityTypePage()) {
    let blKeyValueFound = false;
    convertHTMLCollectionToArray(getPageElementsByTagName("select")).map((item) => {
      const currentElementNameValue = item.getAttribute("name");
      if (currentElementNameValue === 'TemplateServiceId~0') {
        const matchingSelectBoxes = item.children;
        if (matchingSelectBoxes.length > 0) {
          const optionValues = convertHTMLCollectionToArray(matchingSelectBoxes).map((item_2) => {
            return !!item_2.innerHTML && item_2.innerHTML.trim().length > 0 ? item_2.innerHTML : null;
          });
          item.classList.remove("jcf-hidden");
          if (optionValues.indexOf(keyMatchingText) > -1) {
            blKeyValueFound = true;
            matchingSelectBoxes[1].selected = true;
          }
        }
        if (blKeyValueFound) {
          console.log(`Key Value (${keyMatchingText}) found - continuing`);
          top.DoLinkSubmit('ActionSubmit~Save; PushServiceFormPage; PushStaffPage_SpecifyStaff; PushSchedulePage; PopJump; ');
          waitForDefineActivityLabelAndSiteForm(newTeamRegistrations, intIndex);
        } else {
          addError(`error: the required drop down value not found (${keyMatchingText}) - cannot continue`);
          callback_main(errorLog)
          window.close()
        }
      }
    });
  } else {
    setTimeout(() => {
      console.log("waiting for define activities form page to load...");
      waitForDefineActivityTypeForm(newTeamRegistrations, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const createNewTeamNames = (newTeamRegistrations,intIndex) => {
  if (intIndex < newTeamRegistrations.length) {
    console.log(`Registering Team ${intIndex + 1} of ${newTeamRegistrations.length}`);
    console.log(JSON.stringify(newTeamRegistrations[intIndex]));
    top.DoLinkSubmit('ActionSubmit~Jump ServiceDetails.asp?ServiceID=%2D1;');
    waitForDefineActivityTypeForm(newTeamRegistrations,intIndex);
  } else {
    console.log(`no more registrations - done with all ${newTeamRegistrations.length} new team registrations.`);
    if (errorLog.length > 0) {
      console.error("SOME ERRORS WERE FOUND!");
      console.error(errorLog);
      console.error(JSON.stringify(errorLog));
    }
    callback_main(errorLog)
    window.close()
  }
};

const waitForGroupActivitiesPageToLoad = () => {
  if (isOnActivitiesPage()) {
    createNewTeamNames(newTeamNamesParsed,0);
  } else {
    console.log("waiting for group activities page to load...");
    setTimeout(() => {
      waitForGroupActivitiesPageToLoad();
    },pageTimeoutMilliseconds);
  }
};

const waitForMainDistrictPageToLoad = () => {
  console.log("checking if on main district page...");
  const groupActivitiesLinks = getActivitiesPageLink();
  if (groupActivitiesLinks.length > 0) {
    console.log("main district page loaded... clicking on group activities page...");
    groupActivitiesLinks[0].click();
    setTimeout(() => {
      waitForGroupActivitiesPageToLoad();
    },pageTimeoutMilliseconds);
  } else {
    console.log("not yet on main district page...");
    setTimeout(() => {
      waitForMainDistrictPageToLoad();
    },pageTimeoutMilliseconds);
  }
};

const clickNewestGrantLink = () => {
  const availableGrants = convertHTMLCollectionToArray(getPageElementsByTagName("a")).filter((item) => item.innerHTML.trim().indexOf(`America SCORES Soccer Program`) > -1);
  const mostRecentGrant = availableGrants[availableGrants.length - 1];
  console.log(`${availableGrants.length} grants found on page : clicking ${mostRecentGrant}`);
  mostRecentGrant.click();
  waitForMainDistrictPageToLoad();
};

let errorLog = [];

const newTeamNamesFromServer = "!REPLACE_DATABASE_DATA";
const newTeamNamesParsed = JSON.parse(decodeURIComponent(newTeamNamesFromServer));

const mainPageController = () => {
  callback_main = arguments[arguments.length - 1];  //setting callback from the passed implicit arguments sourced in selenium executeAsyncScript()
  if (blWindowFramesExist()) {
    if (isOnActivitiesPage()) {
      createNewTeamNames(newTeamNamesParsed,0);
    } else {
      console.log(`not starting on activities page - attempting to navigate via grants page...`);
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

mainPageController()