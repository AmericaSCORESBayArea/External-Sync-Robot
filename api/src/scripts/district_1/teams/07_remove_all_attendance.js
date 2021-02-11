//wait at least this long before check page load status
const pageTimeoutMilliseconds = 3000;

//STRING CONSTANTS
const activitiesPage_HeaderTagType = "h1";
const activitiesPage_HeaderKeyText = "ACTIVITIES";
const attendanceMainPage_HeaderTagType = "h1";
const attendanceMainPage_HeaderKeyText = "ATTENDANCE";

//WORKER FUNCTIONS
const blWindowFramesExist = () => {return !!window && !!window.frames && !!window.frames.length > 0 && !!window.frames[0].document};
const getMainIFrameContent = () => {return window.frames[0].document;};
const convertHTMLCollectionToArray = (htmlCollection) => {return [].slice.call(htmlCollection);};
const getPageElementsByTagName = (tagName) => {return convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));};
const isOnActivitiesPage = () => {return getPageElementsByTagName(activitiesPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(activitiesPage_HeaderKeyText) === 0).length > 0;};
const isOnAttendanceMainFormForCurrentTeamId = (teamId) => {
  let blReturn = false;
  if (getPageElementsByTagName(attendanceMainPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML === attendanceMainPage_HeaderKeyText).length > 0) {
    convertHTMLCollectionToArray(getPageElementsByTagName("a").map((item) => {
      const onClickText = item.getAttribute("onClick");
      if (!!onClickText) {
        if (onClickText.trim().length > 0) {
          if (onClickText.indexOf(teamId) > -1) {
            blReturn = true;
          }
        }
      }
    }));
  }
  return blReturn;
};
const isOnTeamSchedulePageWithScheduleLink = (teamLinkText) => {
  let blReturn = false;
  const equalsSplit = teamLinkText.split('=');
  if (equalsSplit.length === 4) {
    const ampSplit = equalsSplit[1].split('&');
    if (ampSplit.length === 2) {
      const dateSplit = ampSplit[0].split('%2F');
      if (dateSplit.length === 3) {
        const shortYear = `${dateSplit[2].trim()}`.slice(-2);
        const dateFormattedForPage = [`${dateSplit[0]}`,decodeURIComponent('%2F'),`${dateSplit[1]}`,decodeURIComponent('%2F'),`${shortYear}`].join('');
        convertHTMLCollectionToArray(getPageElementsByTagName("h1")).map((item) => {
          if (!!item.innerHTML) {
            if (item.innerHTML.indexOf(`${dateFormattedForPage}`) === 0) {
              blReturn = true;
            }
          }
        });
      }
    }
  }
  return blReturn;
};

const getCountOfChecked = () => {
  let intCount = 0;
  convertHTMLCollectionToArray(getPageElementsByTagName("span")).map((item) => {
    const classText = item.getAttribute("class");
    if (!!classText) {
      if (classText.trim().length > 0) {
        if (classText.indexOf("jcf-checked") > -1) {
          intCount += 1;
        }
      }
    }
  });
  return intCount;
};

const waitForAllCleared = (teamIds,intIndex,teamScheduleLinks,intScheduleLinksIndex) => {
  if (getCountOfChecked() === 0) {
    console.log("all attendance cleared - saving");
    top.DoLinkSubmit('ActionSubmit~Save; ');
    setTimeout(() => {
      console.log("continuing to the next schedule");
      removeTeamSchedules(teamIds,intIndex,teamScheduleLinks,parseInt(intScheduleLinksIndex) + 1);
    },pageTimeoutMilliseconds);
  } else {
    console.log("waiting for clear all task to complete...");
    setTimeout(() => {
      waitForAllCleared(teamIds,intIndex,teamScheduleLinks,intScheduleLinksIndex);
    },pageTimeoutMilliseconds);
  }
};

const waitForTeamSchedulePage = (teamIds,intIndex,teamScheduleLinks,intScheduleLinksIndex) => {
  if (isOnTeamSchedulePageWithScheduleLink(teamScheduleLinks[intScheduleLinksIndex])) {
    console.log('clicking "CLEAR ALL" button');
    top.DoLinkSubmit('ActionSubmit~AllClear; ');
    waitForAllCleared(teamIds,intIndex,teamScheduleLinks,intScheduleLinksIndex);
  } else {
    setTimeout(() => {
      console.log("waiting to be on team schedule page");
      waitForTeamSchedulePage(teamIds,intIndex,teamScheduleLinks,intScheduleLinksIndex);
    },pageTimeoutMilliseconds);
  }
};

const getTeamScheduleLinks = () => {
  return convertHTMLCollectionToArray(getPageElementsByTagName("a")).map((item) => {
    const onClickText = item.getAttribute("onClick");
    if (!!onClickText) {
      if (onClickText.length > 0) {
        if (onClickText.indexOf("AttendanceRecordsWeekly") > -1) {
          return onClickText;
        }
      }
    }
    return null
  }).filter(item => item !== null);
};


const waitForAttendanceMainForm = (teamIds,intIndex,teamScheduleLinks,intScheduleLinksIndex) => {
  if (isOnAttendanceMainFormForCurrentTeamId(teamIds[intIndex])) {
    if (!teamScheduleLinks) {
      console.log("need to fetch the schedule");
      teamScheduleLinks = getTeamScheduleLinks();
      console.log(`found ${teamScheduleLinks.length} schedules`);
    }
    if (teamScheduleLinks.length > 0) {
      if (intScheduleLinksIndex < teamScheduleLinks.length) {
        console.log(`navigating to schedule ${intScheduleLinksIndex + 1} of ${teamScheduleLinks.length}`);
        top.DoLinkSubmit(`${teamScheduleLinks[intScheduleLinksIndex].split(`top.DoLinkSubmit('`).join('').split(`'); return false;`).join('')}`);
        waitForTeamSchedulePage(teamIds,intIndex,teamScheduleLinks,intScheduleLinksIndex);
      } else {
        console.log("no more schedules remaining for this team, continuing to the next team");
        removeTeamSchedules(teamIds, parseInt(intIndex) + 1, null, 0);
      }
    } else {
      console.log("no schedules found for this team, continuing to the next team");
      removeTeamSchedules(teamIds, parseInt(intIndex) + 1, null, 0);
    }
  } else {
    setTimeout(() => {
      console.log("waiting to be on team schedule page");
      waitForAttendanceMainForm(teamIds,intIndex,teamScheduleLinks,intScheduleLinksIndex);
    },pageTimeoutMilliseconds);
  }
};


const removeTeamSchedules = (teamIds,intIndex,teamScheduleLinks,intScheduleLinksIndex) => {
  if (intIndex < teamIds.length) {
    console.log(`Removing Team Schedule ${intIndex + 1} of ${teamIds.length}`);
    top.DoLinkSubmit(`ActionSubmit~save; jump /Web/sms2/Services/AttendanceRecordsWeekly.asp?ServiceID=${teamIds[intIndex]};`);
    waitForAttendanceMainForm(teamIds,intIndex,teamScheduleLinks,intScheduleLinksIndex);
  } else {
    console.log(`no more team schedules to enter - done with all ${teamIds.length} team schedule removals.`);
    if (errorLog.length > 0) {
      console.error("SOME ERRORS WERE FOUND!");
      console.error(errorLog);
      console.error(JSON.stringify(errorLog));
    }
  }
};

const mainPageController = (teamIds) => {
  if (!!teamIds && teamIds.length > 0) {
    console.log(`starting schedule removal for ${teamIds.length} teams`);
    if (isOnActivitiesPage()) {
      removeTeamSchedules(teamIds,0,null,0);
    } else {
      console.error(`Not on the correct page. Please navigate to "Activities Page" and run again when the page header is "${activitiesPage_HeaderKeyText}"`);
    }
  } else {
    console.error('no teamIds passed');
  }
};