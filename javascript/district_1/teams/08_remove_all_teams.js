//wait at least this long before check page load status
const pageTimeoutMilliseconds = 3000;

//STRING CONSTANTS
const activitiesPage_HeaderTagType = "h1";
const activitiesPage_HeaderKeyText = "ACTIVITIES";
const activityDetailsPage_HeaderTagType = "h1";
const activityDetailsPage_HeaderKeyText = "ACTIVITY DETAILS";
const deleteActivityConfirm_HeaderTagType = "h1";
const deleteActivityConfirm_HeaderKeyText = "DELETE activity";

//WORKER FUNCTIONS
const getMainIFrameContent = () => {return window.frames[0].document;};
const convertHTMLCollectionToArray = (htmlCollection) => {return [].slice.call(htmlCollection);};
const getPageElementsByTagName = (tagName) => {return convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));};
const isOnActivitiesPage = () => {return getPageElementsByTagName(activitiesPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(activitiesPage_HeaderKeyText) === 0).length > 0;};
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
    console.log("confirming delete");
    top.DoLinkSubmit('ActionSubmit~confirm');
    setTimeout(() => {
    console.log("navigating to next");
    removeTeamSchedules(teamIds,parseInt(intIndex) + 1);
    },pageTimeoutMilliseconds);
  } else {
    setTimeout(() => {
      console.log("waiting to be on confirm delete page");
      waitForDeleteConfirmForm(teamIds,intIndex);
    },pageTimeoutMilliseconds);
  }

};

const waitForDetailsMainForm = (teamIds,intIndex) => {
  if (isOnActivityDetailsPageForCurrentTeam(teamIds[intIndex])) {
      console.log("clicking remove button");
      top.DoLinkSubmit('ActionSubmit~Delete; ');
      waitForDeleteConfirmForm(teamIds,intIndex);
  } else {
    setTimeout(() => {
      console.log("waiting to be on team details page");
      waitForDetailsMainForm(teamIds,intIndex);
    },pageTimeoutMilliseconds);
  }
};

const removeTeamSchedules = (teamIds,intIndex) => {
  if (intIndex < teamIds.length) {
    console.log(`Removing Team ${intIndex + 1} of ${teamIds.length}`);
    top.DoLinkSubmit(`ActionSubmit~save; ; jump /Web/sms2/Services/ServiceForm.asp?ServiceID=${teamIds[intIndex]};`);
    waitForDetailsMainForm(teamIds,intIndex);
  } else {
    console.log(`no more teams to remove - done with all ${teamIds.length} team schedule removals.`);
  }
};

const mainPageController = (teamIds) => {
  if (!!teamIds && teamIds.length > 0) {
    console.log(`starting team removal for ${teamIds.length} teams`);
    if (isOnActivitiesPage()) {
      removeTeamSchedules(teamIds,0);
    } else {
      console.error(`Not on the correct page. Please navigate to "Activities Page" and run again when the page header is "${activitiesPage_HeaderKeyText}"`);
    }
  } else {
    console.error('no teamIds passed');
  }
};