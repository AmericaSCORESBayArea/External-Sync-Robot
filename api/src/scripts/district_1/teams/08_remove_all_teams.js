const instanceDate = new Date().toISOString();

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
const activitiesPage_HeaderTagType = "h1";
const activitiesPage_HeaderKeyText = "ACTIVITIES";
const activityDetailsPage_HeaderTagType = "h1";
const activityDetailsPage_HeaderKeyText = "ACTIVITY DETAILS";
const deleteActivityConfirm_HeaderTagType = "h1";
const deleteActivityConfirm_HeaderKeyText = "DELETE activity";

//WORKER FUNCTIONS
const blWindowFramesExist = () => {return !!window && !!window.frames && !!window.frames.length > 0 && !!window.frames[0].document};
const getMainIFrameContent = () => {return window.frames[0].document;};
const convertHTMLCollectionToArray = (htmlCollection) => {return [].slice.call(htmlCollection);};
const getPageElementsByTagName = (tagName) => {return convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));};
const isOnActivitiesPage = () => {return getPageElementsByTagName(activitiesPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(activitiesPage_HeaderKeyText) === 0).length > 0;};

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

const isOnActivityDetailsPageForCurrentTeam = (teamId) => {
  let blReturn = false;
  if (getPageElementsByTagName(activityDetailsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().toLowerCase().indexOf(activityDetailsPage_HeaderKeyText.trim().toLowerCase()) === 0).length > 0) {
    convertHTMLCollectionToArray(getPageElementsByTagName("span")).map((item) => {
      if (!!item.innerHTML) {
        if (item.innerHTML.trim() === teamId) {
          blReturn = true;
        }
      }
    });
  }
  return blReturn;
};
const isOnConfirmDeletePage = () => {
  let blReturn = false;
  if (getPageElementsByTagName(deleteActivityConfirm_HeaderTagType).filter((item) => {
    return !!item.innerHTML && item.innerHTML.trim().indexOf(deleteActivityConfirm_HeaderKeyText) === 0
  }).length > 0) {
    blReturn = true;
  }
  return blReturn;
};
const waitForDeleteConfirmForm = (teamIds,intIndex) => {
  if (isOnConfirmDeletePage()) {
    sendLog("confirming delete");
    top.DoLinkSubmit('ActionSubmit~confirm');
    setTimeout(() => {
    sendLog("navigating to next");
    removeTeamSchedules(teamIds,parseInt(intIndex) + 1);
    },pageTimeoutMilliseconds);
  } else {
    setTimeout(() => {
      sendLog("waiting to be on confirm delete page");
      waitForDeleteConfirmForm(teamIds,intIndex);
    },pageTimeoutMilliseconds);
  }

};

const waitForDetailsMainForm = (teamIds,intIndex) => {
  if (isOnActivityDetailsPageForCurrentTeam(teamIds[intIndex])) {
      sendLog("clicking remove button");
      top.DoLinkSubmit('ActionSubmit~Delete; ');
      waitForDeleteConfirmForm(teamIds,intIndex);
  } else {
    setTimeout(() => {
      sendLog("waiting to be on team details page");
      waitForDetailsMainForm(teamIds,intIndex);
    },pageTimeoutMilliseconds);
  }
};

const removeTeamSchedules = (teamIds,intIndex) => {
  if (intIndex < teamIds.length) {
    sendLog(`Removing Team ${intIndex + 1} of ${teamIds.length}`);
    top.DoLinkSubmit(`ActionSubmit~save; ; jump /Web/sms2/Services/ServiceForm.asp?ServiceID=${teamIds[intIndex]};`);
    waitForDetailsMainForm(teamIds,intIndex);
  } else {
    sendLog(`no more teams to remove - done with all ${teamIds.length} team schedule removals.`);
  }
};

const mainPageController = (teamIds) => {
  if (!!teamIds && teamIds.length > 0) {
    sendLog(`starting team removal for ${teamIds.length} teams`);
    if (isOnActivitiesPage()) {
      removeTeamSchedules(teamIds,0);
    } else {
      console.error(`Not on the correct page. Please navigate to "Activities Page" and run again when the page header is "${activitiesPage_HeaderKeyText}"`);
    }
  } else {
    console.error('no teamIds passed');
  }
};