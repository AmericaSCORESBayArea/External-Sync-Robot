//initializing callback that will run with out data
let callback_main = null;

//wait at least this long before check page load status
const pageTimeoutMilliseconds = 5000;

//STRING CONSTANTS
const grantsPage_HeaderTagType = "span";
const grantsPage_HeaderKeyText = "GRANT LIST";
const activitiesPage_HeaderTagType = "td";
const activitiesPage_HeaderKeyText = "ACTIVITIES";
const youthParticipantsRegistrationPage_FormElementClassName = "FormNote";

const attendancePage_HeaderTagType = "td";
const attendancePage_HeaderKeyText = "ATTENDANCE";

const youthParticipantsPage_PaginationClassName = "PageAction";

//WORKER FUNCTIONS
const getMainIFrameContent = () => {return window.frames[0].document;};
const getPageElementsByClassName = (className) => {return getMainIFrameContent().getElementsByClassName(className);};
const convertHTMLCollectionToArray = (htmlCollection) => {return [].slice.call(htmlCollection);};
const getPageElementsByTagName = (tagName) => {return convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));};
const getGroupActivitiesPageLink = () => getPageElementsByTagName("a").filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(`Group Activities`) > -1);
const isOnActivitiesPage = () => {return getPageElementsByTagName(activitiesPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(activitiesPage_HeaderKeyText) > -1).length > 0;};
const isOnGrantsPage = () => {return getPageElementsByTagName(grantsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(grantsPage_HeaderKeyText) > -1).length > 0;};
const isOnActivityDetailsPageForCurrentTeam = (teamId) => {
  let blReturn = false;
  if (getPageElementsByTagName("td").filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf("GENERAL INFO") > -1).length > 0) {
    convertHTMLCollectionToArray(getPageElementsByTagName("td")).map((item) => {
      if (!!item.innerHTML) {
        if (item.innerHTML.trim() === teamId) {
          blReturn = true;
        }
      }
    });
  }
  return blReturn;
};
const isOnActivitySchedulePageForCurrentTeam = (teamName) => {
  let blReturn = false;
  if (getPageElementsByTagName("td").filter(item => !!item.innerHTML && (item.innerHTML.trim().indexOf("SCHEDULE") > -1 || item.innerHTML.trim().indexOf("ADD DATE(S) TO SCHEDULE") > -1)).length > 0) {
    convertHTMLCollectionToArray(getPageElementsByTagName("td")).map((item) => {
      if (!!item.innerHTML) {
        if (item.innerHTML.trim().indexOf(teamName) > -1) {
          blReturn = true;
        }
      }
    });
  }
  return blReturn;
};
const isOnActivityEnrollmentPageForCurrentTeam = (teamName) => {
  let blReturn = false;
  if (getPageElementsByTagName("td").filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf("ENROLLMENT LIST (") > -1).length > 0) {
    convertHTMLCollectionToArray(getPageElementsByTagName("td")).map((item) => {
      if (!!item.innerHTML) {
        if (item.innerHTML.trim().indexOf(teamName) > -1) {
          blReturn = true;
        }
      }
    });
  }
  return blReturn;
};

const isOnAttendancePageForSpecificDate = (dateString) => {
  let blReturn = false;
  if (getPageElementsByTagName(attendancePage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(attendancePage_HeaderKeyText) > -1).length > 0) {
    convertHTMLCollectionToArray(getPageElementsByTagName("td")).map((item) => {
      if (!!item.innerHTML) {
        const dateWithoutDayOfWeek = dateString.split(', ').map((item,index) => {
          if (index === 0) {
            return item.slice(0,3);
          } else {
            if (index === 1) {
              const internalSplit = item.split(" ");
              return [internalSplit[0].slice(0,3), internalSplit[1]].join(" ");
            } else {
              return item;
            }
          }
        }).join(', ');
        if (item.innerHTML.indexOf(dateWithoutDayOfWeek) > -1) {
          blReturn = true;
        }
      }
    })

  }
  return blReturn;
};

const getCurrentSchedulePageIndex = () => {
  let currentPageIndex = -1;
  const pageNavigation = convertHTMLCollectionToArray(getPageElementsByClassName(youthParticipantsPage_PaginationClassName)).filter(item => !!item.children && item.children.length > 1);
  if (pageNavigation.length > 0) {
    if (!!pageNavigation[0].children) {
      convertHTMLCollectionToArray(pageNavigation[0].children).map((item) => {
        if (item.tagName.toLowerCase() === "span") {
          currentPageIndex = item.innerHTML;
        }
      });
    }
  }
  return currentPageIndex;
};

const navigateToNextSchedulePage = () => {
  let intNextPage = -1;
  const currentPageIndex = getCurrentSchedulePageIndex();
  if (parseInt(currentPageIndex) > 0) {
    const proposedNextPage = parseInt(currentPageIndex) + 1;
    const pageNavigation = getPageElementsByTagName("a");
    if (pageNavigation.length > 0) {
      convertHTMLCollectionToArray(pageNavigation).map((item) => {
        const onClickText = item.getAttribute("onClick");
        if (!!onClickText) {
          if (onClickText.indexOf(`top.DoLinkSubmit('ActionSubmit~Set ListerPage ${proposedNextPage};`) > -1) {
            intNextPage = proposedNextPage;
            item.click();
          }
        }
      });
    } else {
      console.error("cannot determine the current schedule page index");
    }
  }
  if (intNextPage > -1) {
    console.log(`navigating to next schedule page ${intNextPage}`);
  } else {
    console.log("next schedule page button not found - this may be the last page");
  }
  return intNextPage;
};

const waitForNextSchedulePageToLoad = (teamIds,intIndex,teamDetails,schedulesFound,intNextIndex,callback) => {
  const currentPage = getCurrentSchedulePageIndex();
  if (`${currentPage}` === `${intNextIndex}`) {
    callback(teamIds,intIndex,teamDetails,schedulesFound);
  } else {
    console.log("waiting for next schedules page to load....");
    setTimeout(() => {
      waitForNextSchedulePageToLoad(teamIds,intIndex,teamDetails,schedulesFound,intNextIndex,callback);
    },pageTimeoutMilliseconds);
  }
};

const addError = (message) => {
  console.error(message);
  errorLog.push(message);
};


const waitForServiceDateAttendanceMainForm = (teamIds,intIndex,teamDetails,schedulesFound,foundParticipants,attendanceFound,intCurrentScheduleIndex) => {
  if (isOnAttendancePageForSpecificDate(schedulesFound[intCurrentScheduleIndex].ServiceDate)) {
    let arrayOfFoundOnPage = [];
    convertHTMLCollectionToArray(getPageElementsByTagName("tr")).map((item) => {
      if (!!item.children) {
        if (item.children.length === 5) {
          if (!!item.children[0].innerHTML) {
            const name = item.children[0].innerHTML;
            const id = schedulesFound[intCurrentScheduleIndex].ServiceDateID;
            let value = "Not set";
            if (item.children[1].children) {
              if (item.children[1].children.length > 0) {
                if (item.children[1].children[0].checked) {
                  value = "Present";
                }
              }
            }
            if (item.children[2].children) {
              if (item.children[2].children.length > 0) {
                if (item.children[2].children[0].checked) {
                  value = "Absent";
                }
              }
            }
            arrayOfFoundOnPage.push({
              name,
              id,
              value
            });
          }
        }
      }
    });
    console.log(`found ${arrayOfFoundOnPage.length} attendance values`);
    const newAttendanceFound = [
      ...attendanceFound,
      ...arrayOfFoundOnPage
    ];
    console.log("getting next service date attendance");
    setTimeout(() => {
      getAttendanceData(teamIds, intIndex, teamDetails,schedulesFound,foundParticipants,newAttendanceFound,parseInt(intCurrentScheduleIndex) + 1);
    }, pageTimeoutMilliseconds);
  } else {
    setTimeout(() => {
      console.log("waiting for service date main attendance form page to load...");
      waitForServiceDateAttendanceMainForm(teamIds,intIndex,teamDetails,schedulesFound,foundParticipants,attendanceFound,intCurrentScheduleIndex);
    }, pageTimeoutMilliseconds);
  }
};

const getAttendanceData = (teamIds,intIndex,teamDetails,schedulesFound,foundParticipants,attendanceFound,intCurrentScheduleIndex) => {
  if (intCurrentScheduleIndex < schedulesFound.length) {
    try {
      console.log(`navigating to schedule ${parseInt(intCurrentScheduleIndex) + 1} of ${schedulesFound.length} - ${schedulesFound[intCurrentScheduleIndex].ServiceDateID}`);
      top.DoLinkSubmit(`ActionSubmit~push; jump AttendanceByService.asp?ServiceDateID=${schedulesFound[intCurrentScheduleIndex].ServiceDateID}`);
      setTimeout(() => {
        waitForServiceDateAttendanceMainForm(teamIds, intIndex, teamDetails, schedulesFound, foundParticipants, attendanceFound, intCurrentScheduleIndex);
      },pageTimeoutMilliseconds);
    } catch(e) {
      console.error("unknown error within getAttendanceData - maybe page was in the middle of loading... trying again...");
      setTimeout(() => {
        getAttendanceData(teamIds, intIndex, teamDetails, schedulesFound, foundParticipants, attendanceFound, intCurrentScheduleIndex);
      },pageTimeoutMilliseconds);
    }
  } else {
    console.log("no more schedules - continuing to the next team...");
    resultsLog.push({
      district:`district_2`,
      details: teamDetails,
      schedule: schedulesFound,
      enrollment: foundParticipants,
      attendance: attendanceFound,
      browserDate: new Date().toISOString(),
      instanceDate
    });
    console.log("navigating to next team");
    navigateToTeamDetailsPage(teamIds, parseInt(intIndex) + 1);
  }
};

const waitForActivityEnrollmentPage = (teamIds,intIndex,teamDetails,schedulesFound) => {
  if (isOnActivityEnrollmentPageForCurrentTeam(teamDetails.ActivityName)) {
    let foundParticipants = [];
    convertHTMLCollectionToArray(getPageElementsByTagName("tr")).map((item) => {
      const currentMouseOver = item.getAttribute("onMouseOver");
      if (!!currentMouseOver) {
        if (currentMouseOver.trim() === "$(this).addClass('rowHighlight')") {
          if (!!item.children) {
            if (item.children.length === 6) {
              if (!!item.children[5].children) {
                const currentOnClick = item.children[5].children[0].getAttribute("onClick");
                if (!!currentOnClick) {
                  if (currentOnClick.trim().length > 0) {
                    if (currentOnClick.indexOf(`ActionSubmit~push; jump EnrollmentHistory.asp?PersonID=`) > -1) {
                      if (currentOnClick.indexOf(`&ServiceID=`) > -1) {
                        const currentFullName = item.children[0].innerHTML.trim();
                        const currentEqualsSplit = currentOnClick.split('=');
                        if (currentEqualsSplit.length === 3) {
                          const currentPersonId = currentEqualsSplit[1].split('&ServiceID').join('');
                          const currentServiceID = currentEqualsSplit[2].split('); return false;').join('').split("'").join('');
                          console.log(`found participant ${currentFullName}`);
                          const registeredParticipant = {
                            fullName: currentFullName,
                            personId: currentPersonId,
                            serviceId: currentServiceID
                          };
                          foundParticipants.push(registeredParticipant);
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
    });

    if (schedulesFound.length > 0 && foundParticipants.length > 0) {
      console.log("getting attendance data");
      getAttendanceData(teamIds, intIndex, teamDetails,schedulesFound,foundParticipants,[],0);
    } else {
      console.log("either no enrollment or no schedule is found - skipping attendance fetch");
      resultsLog.push({
        details: teamDetails,
        schedule: schedulesFound,
        enrollment: foundParticipants,
        attendance: [],
        browserDate: new Date().toISOString(),
        instanceDate
      });
      console.log("navigating to next team");
      navigateToTeamDetailsPage(teamIds, parseInt(intIndex) + 1);
    }
  } else {
    setTimeout(() => {
      console.log(`waiting for activity enrollment page to load for team id ${teamIds[intIndex]}...`);
      waitForActivityEnrollmentPage(teamIds, intIndex, teamDetails,schedulesFound);
    }, pageTimeoutMilliseconds);
  }
};

const waitForActivityDetailsPage = (teamIds,intIndex) => {
  if (isOnActivityDetailsPageForCurrentTeam(teamIds[intIndex])) {
    const newObj = {};
    const pageFormNotes = convertHTMLCollectionToArray(getPageElementsByClassName(youthParticipantsRegistrationPage_FormElementClassName));
    if (pageFormNotes.length > 0) {
      if (!!pageFormNotes[0].parentNode) {
        if (!!pageFormNotes[0].parentNode.innerHTML) {
          const innerHTMLSplit = pageFormNotes[0].parentNode.innerHTML.split("</span>");
          if (innerHTMLSplit.length === 2) {
            newObj.ActivityName = decodeURIComponent(innerHTMLSplit[1].trim());
            newObj.ActivityID = teamIds[intIndex];
          }
        }
      }
    }
    console.log("getting team schedule");
    navigateToTeamSchedulePage(teamIds,intIndex,newObj);
  } else {
    setTimeout(() => {
      console.log(`waiting for activity details page to load for team id ${teamIds[intIndex]}...`);
      waitForActivityDetailsPage(teamIds, intIndex);
    }, pageTimeoutMilliseconds);
  }
};

const waitForActivitySchedulePage = (teamIds,intIndex,teamDetails,schedulesFound) => {
  let newSchedulesFound = [];
  if (!!teamDetails.ActivityName) {
    if (isOnActivitySchedulePageForCurrentTeam(teamDetails.ActivityName)) {
      convertHTMLCollectionToArray(getPageElementsByTagName("tr")).map((item) => {
        let currentSchedule = {};
        const currentMouseOver = item.getAttribute("onMouseOver");
        if (!!currentMouseOver) {
          if (currentMouseOver.trim() === "$(this).addClass('rowHighlight')") {
            if (!!item.children) {
              if (item.children.length === 5) {
                if (!!item.children[0].children) {
                  if (item.children[0].children.length > 0) {
                    const serviceDateIdValue = item.children[0].children[0].getAttribute("value");
                    if (!!serviceDateIdValue) {
                      if (serviceDateIdValue.trim().length > 5) {
                        currentSchedule.ServiceDateID = serviceDateIdValue.trim();
                        if (!!item.children[1].innerHTML) {
                          if (item.children[1].innerHTML.trim().length > 0) {
                            currentSchedule.ServiceDate = item.children[1].innerHTML.trim();
                          }
                        }
                        if (!!item.children[2].innerHTML) {
                          if (item.children[2].innerHTML.trim().length > 0) {
                            currentSchedule.BeginTime = item.children[2].innerHTML.trim();
                          }
                        }
                        if (!!item.children[3].innerHTML) {
                          if (item.children[3].innerHTML.trim().length > 0) {
                            currentSchedule.EndTime = item.children[3].innerHTML.trim();
                          }
                        }
                        newSchedulesFound.push(currentSchedule);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      const updatedSchedulesFound = [
        ...schedulesFound,
        ...newSchedulesFound
      ];

      console.log(`${newSchedulesFound.length} schedules found on THIS page`);
      console.log(`${updatedSchedulesFound.length} schedules found on ALL pages`);

      const intNextPage = navigateToNextSchedulePage();
      if (intNextPage > -1) {
        waitForNextSchedulePageToLoad(teamIds,intIndex,teamDetails,updatedSchedulesFound,intNextPage,waitForActivitySchedulePage);
      } else {

        if (updatedSchedulesFound.length > 0) {
          console.log(`adding team schedule with ${updatedSchedulesFound.length} dates`);
          console.log('continuing to get enrollment information');
          top.DoLinkSubmit(`ActionSubmit~save; ; jump /Web/sms/Services/EnrollmentList.asp?ServiceID=${teamIds[intIndex]};`);
          waitForActivityEnrollmentPage(teamIds,intIndex,teamDetails,updatedSchedulesFound);
        } else {
          console.log("no schedules found - continuing to next team");
          resultsLog.push({
            details:teamDetails,
            schedule:schedulesFound,
            enrollment:[],
            attendance:[],
            browserDate: new Date().toISOString(),
            instanceDate
          });
          navigateToTeamDetailsPage(teamIds, parseInt(intIndex) + 1);
        }
      }
    } else {
      setTimeout(() => {
        console.log(`waiting for activity schedule page to load for team id ${teamIds[intIndex]}...`);
        waitForActivitySchedulePage(teamIds, intIndex, teamDetails,schedulesFound);
      }, pageTimeoutMilliseconds);
    }
  } else {
    addError(`error: ActivityName not found - cannot continue (${teamIds[intIndex]} | ${teamDetails})`);
  }
};

const navigateToTeamSchedulePage = (teamIds,intIndex,teamDetails) => {
  top.DoLinkSubmit(`ActionSubmit~Push ; Jump ServiceSchedule.asp?ServiceID=${teamIds[intIndex]}; `);
  waitForActivitySchedulePage(teamIds, intIndex, teamDetails,[]);
};

const navigateToTeamDetailsPage = (teamIds,intIndex) => {
  if (intIndex < teamIds.length) {
    console.log(`navigating to team ${teamIds[intIndex]} - ${intIndex + 1} of ${teamIds.length}`);
    try {
      top.DoLinkSubmit(`ActionSubmit~push; jump ServiceForm.asp?ServiceID=${teamIds[intIndex]}`);
      waitForActivityDetailsPage(teamIds, intIndex);
    } catch(e) {
      console.error("unknown error within navigateToTeamSchedulePage - maybe page was in the middle of loading... trying again...");
      setTimeout(() => {
        navigateToTeamDetailsPage(teamIds,intIndex);
      },pageTimeoutMilliseconds);
    }
  } else {
    console.log(`no more team ids - done with getting details for all ${teamIds.length} teams`);
    console.log(`START: ${instanceDate}`);
    console.log(`END: ${new Date().toISOString()}`);
    if (resultsLog.length === 0) {
      addError("no results were found");
    }
    console.log("no teams remaining - running callback");
    callback_main(resultsLog);
    if (errorLog.length > 0) {
      console.error("SOME ERRORS WERE FOUND!");
      console.error(errorLog);
      console.error(JSON.stringify(errorLog));
    }
  }
};

const getTeamIds = () => {
  const keyText = "ServiceID=";
  return convertHTMLCollectionToArray(getPageElementsByTagName("a")).map((item) => {
    const currentElementNameValue = item.getAttribute("onClick");
    if (!!currentElementNameValue) {
      if (currentElementNameValue.indexOf(keyText) > -1) {
        const numberSplit_1 = currentElementNameValue.split(keyText);
        if (numberSplit_1.length === 2) {
          const numberSplit_2 = numberSplit_1[1].split("'");
          if (numberSplit_2.length === 2) {
            return numberSplit_2[0];
          }
        }
      }
    }
    return null;
  }).filter(item => !!item);
};

const waitForMainGroupActivitiesPageToLoad = () => {
  console.log("checking if on main group activities and staff page...");
  if (isOnActivitiesPage()) {
    gatherTeamDetails();
  } else {
    console.log("not yet on main group activities page...");
    setTimeout(() => {
      waitForMainGroupActivitiesPageToLoad();
    },pageTimeoutMilliseconds);
  }
};

const waitForMainDistrictPageToLoad = () => {
  console.log("checking if on main district page...");
  const groupActivitiesLinks = getGroupActivitiesPageLink();
  if (groupActivitiesLinks.length > 0) {
    console.log("main district page loaded... clicking on group activities page...");
    groupActivitiesLinks[0].click();
    waitForMainGroupActivitiesPageToLoad();
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

let resultsLog = [];
let errorLog = [];

const instanceDate = new Date().toISOString();

const gatherTeamDetails = () => {
  const teamIds = getTeamIds();
  if (teamIds.length > 0) {
    console.log(`${teamIds.length} team ids found - getting the details for each team`);
    navigateToTeamDetailsPage(teamIds,0);
  } else {
    addError("No team ids were found - please check that some teams have been added");
  }
};

const mainPageController = () => {
  callback_main = arguments[arguments.length - 1];  //setting callback from the passed implicit arguments sourced in selenium executeAsyncScript()
  console.log(`starting get existing teams and schedules...`);
  if (isOnActivitiesPage()) {
    gatherTeamDetails();
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
};

mainPageController();