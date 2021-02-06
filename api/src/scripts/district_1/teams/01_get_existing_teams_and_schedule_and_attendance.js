//README
//    after running, import the result into "team_details_verify" collection after removing the existing documents
// Time estimate: 7 minutes for 37 teams with 1,155 schedules across them all and no attendance data pushed yet

// todo get this script to also get the values for each date that the team meets

//initializing callback that will run with out data
let callback_main = null;

//wait at least this long before check page load status
const pageTimeoutMilliseconds = 3000;

//STRING CONSTANTS
const grantsPage_HeaderTagType = "h1";
const grantsPage_HeaderKeyText = "Agency Programs";
const activitiesPage_HeaderTagType = "h1";
const activitiesPage_HeaderKeyText = "ACTIVITIES";
const activityDetailsPage_HeaderTagType = "h1";
const activityDetailsPage_HeaderKeyText = "ACTIVITY DETAILS";
const activitySchedulePage_HeaderTagType = "h1";
const activitySchedulePage_HeaderKeyText = "SCHEDULE";
const activityEnrollmentPage_HeaderTagType = "h1";
const activityEnrollmentPage_HeaderKeyText = "ENROLLMENT";
const activityAttendancePage_HeaderTagType = "h1";
const activityAttendancePage_HeaderKeyText = "ATTENDANCE";
const youthParticipantsRegistrationPage_FormElementClassName = "validationArea";

const youthParticipantsPage_PaginationClassName = "pagination";
const youthParticipantsPage_PaginationActiveClassName = "active";

const arrayOfAttendanceStatuses = ["complete","incomplete"];

//WORKER FUNCTIONS
const getMainIFrameContent = () => {return window.frames[0].document;};
const getPageElementsByClassName = (className) => {return getMainIFrameContent().getElementsByClassName(className);};
const convertHTMLCollectionToArray = (htmlCollection) => {return [].slice.call(htmlCollection);};
const getPageElementsByTagName = (tagName) => {return convertHTMLCollectionToArray(getMainIFrameContent().getElementsByTagName(tagName));};
const isOnGrantsPage = () => getPageElementsByTagName(grantsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(grantsPage_HeaderKeyText) > -1).length > 0;
const isOnActivitiesPage = () => {return getPageElementsByTagName(activitiesPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(activitiesPage_HeaderKeyText) === 0).length > 0;};
const getActivitiesPageLink = () => getPageElementsByTagName("span").filter(item => !!item.innerHTML && item.innerHTML.trim() === `Activities`);
const isOnActivityDetailsPageForCurrentTeam = (teamId) => {
  let blReturn = false;
  if (getPageElementsByTagName(activityDetailsPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(activityDetailsPage_HeaderKeyText) === 0).length > 0) {
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
const isOnActivitySchedulePageForCurrentTeam = (teamName) => {
  let blReturn = false;
  if (getPageElementsByTagName(activitySchedulePage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(activitySchedulePage_HeaderKeyText) === 0).length > 0) {
    convertHTMLCollectionToArray(getPageElementsByTagName("h2")).map((item) => {
      if (!!item.innerHTML) {
        if (item.innerHTML.trim() === teamName) {
          blReturn = true;
        }
      }
    });
  }
  return blReturn;
};

const isOnActivityEnrollementPageForCurrentTeam = (teamName) => {
  let blReturn = false;
  if (getPageElementsByTagName(activityEnrollmentPage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(activityEnrollmentPage_HeaderKeyText) === 0).length > 0) {
    convertHTMLCollectionToArray(getPageElementsByTagName("h2")).map((item) => {
      if (!!item.innerHTML) {
        if (item.innerHTML.trim() === teamName) {
          blReturn = true;
        }
      }
    });
  }
  return blReturn;
};

const isOnActivityAttendancePageForCurrentTeam = (teamName) => {
  let blReturn = false;
  if (getPageElementsByTagName(activityAttendancePage_HeaderTagType).filter(item => !!item.innerHTML && item.innerHTML.trim().indexOf(activityAttendancePage_HeaderKeyText) === 0).length > 0) {
    convertHTMLCollectionToArray(getPageElementsByTagName("h2")).map((item) => {
      if (!!item.innerHTML) {
        if (item.innerHTML.trim() === teamName) {
          blReturn = true;
        }
      }
    });
  }
  return blReturn;
};

const isOnAttendanceWeekMainForm = (link) => {
  let blReturn = false;
  const linkWithoutServiceFormat = link.split(`serviceFormatId=&`).join('');
  const linkQuestionMarkSplit = linkWithoutServiceFormat.split(`?`);
  const linkCompare = linkQuestionMarkSplit[linkQuestionMarkSplit.length - 1].trim().toLowerCase();
  if (linkQuestionMarkSplit.length > 0) {
    convertHTMLCollectionToArray(getPageElementsByTagName(`form`)).map((item) => {
      const currentAction = item.getAttribute("action");
      const currentActionQuestionMarkSplit = currentAction.split(`?`);
      const currentActionCompare = currentActionQuestionMarkSplit[currentActionQuestionMarkSplit.length - 1].trim().toLowerCase();
      if (`${linkCompare}`.indexOf(`${currentActionCompare}`) === 0) {
        blReturn = true;
      }
    });
  }
  return blReturn;
};

const getCurrentSchedulePageIndex = () => {
  let currentPageIndex = -1;
  const pageNavigation = getPageElementsByClassName(youthParticipantsPage_PaginationClassName);
  if (pageNavigation.length > 0) {
    convertHTMLCollectionToArray(pageNavigation[0].children).map((item) => {
      if (!!item.children) {
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

const navigateToNextSchedulePage = () => {
  let intNextPage = -1;
  const currentPageIndex = getCurrentSchedulePageIndex();
  if (currentPageIndex > 0) {
    const proposedNextPage = parseInt(currentPageIndex) + 1;
    const pageNavigation = getPageElementsByClassName(youthParticipantsPage_PaginationClassName);
    if (pageNavigation.length > 0) {
      convertHTMLCollectionToArray(pageNavigation[0].children).map((item) => {
        if (!!item.children) {
          convertHTMLCollectionToArray(item.children).map((item_2) => {
            const onClickText = item_2.getAttribute("onClick");
            if (!!onClickText) {
              if (onClickText.trim().length > 0) {
                if (onClickText.indexOf(`top.DoLinkSubmit('ActionSubmit~Set ListerPage ${proposedNextPage}`) > -1) {
                  intNextPage = proposedNextPage;
                  item_2.click();
                }
              }
            }
          });
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
  if (currentPage === intNextIndex) {
    callback(teamIds,intIndex,teamDetails,schedulesFound);
  } else {
    console.log("waiting for next schedules page to load....");
    setTimeout(() => {
      waitForNextSchedulePageToLoad(teamIds,intIndex,teamDetails,schedulesFound,intNextIndex,callback);
    },pageTimeoutMilliseconds);
  }
};


const fieldLabelMapping = {
  "Workplan Activity Name / Activity Type": "ActivityType",
  "Activity Label": "ActivityName",
  "Activity Category": "ActivityCategory",
  "Activity Description": "ActivityDescription",
  "Service Site": "ActivitySite",
  "Additional Notes": "ActivityNotes",
  "Activity ID": "ActivityID"
};


const addError = (message) => {
  console.error(message);
  errorLog.push(message);
};

const waitForActivityEnrollmentPage = (teamIds,intIndex,teamDetails,schedulesFound) => {
  if (isOnActivityEnrollementPageForCurrentTeam(teamDetails.ActivityName)) {
    let foundParticipants = [];
    convertHTMLCollectionToArray(getPageElementsByTagName("a")).map((item) => {
      const currentOnClick = item.getAttribute("onClick");
      if (!!currentOnClick) {
        if(currentOnClick.trim().length > 0) {
          if (currentOnClick.indexOf(`ActionSubmit~push; jump EnrollmentHistory.asp?PersonID=`) > -1) {
            if (currentOnClick.indexOf(`&ServiceID=`) > -1) {
              const currentFullName = item.innerHTML;
              const currentEqualsSplit = currentOnClick.split('=');
              if (currentEqualsSplit.length === 3) {
                const currentPersonId = currentEqualsSplit[1].split('&ServiceID').join('');
                const currentServiceID = currentEqualsSplit[2].split('); return false;').join('').split("'").join('');
                console.log(`found participant ${currentFullName}`);
                const registeredParticipant = {
                  fullName:currentFullName,
                  personId:currentPersonId,
                  serviceId:currentServiceID
                };
                foundParticipants.push(registeredParticipant);
              }
            }
          }
        }
      }
    });
    console.log(`adding team enrollment with ${foundParticipants.length} participants`);
    console.log('continuing to get attendance data');
    top.DoLinkSubmit(`ActionSubmit~save; ; jump /Web/sms2/Services/ServiceFindByWeek.asp?ServiceID=${teamIds[intIndex]};`);
    waitForActivityAttendancePage(teamIds,intIndex,teamDetails,schedulesFound,foundParticipants);
  } else {
    setTimeout(() => {
      console.log(`waiting for activity enrollment page to load for team id ${teamIds[intIndex]}...`);
      waitForActivityEnrollmentPage(teamIds, intIndex, teamDetails,schedulesFound);
    }, pageTimeoutMilliseconds);
  }
};

const waitForActivityAttendancePage = (teamIds,intIndex,teamDetails,schedulesFound,participantsFound) => {
  if (isOnActivityAttendancePageForCurrentTeam(teamDetails.ActivityName)) {

    let attendanceWeekDateRangeLinks = [];
    let attendanceDateRangeValues = [];
    let attendanceDateRangeStatuses = [];

    convertHTMLCollectionToArray(getPageElementsByTagName("a")).map((item) => {
      const currentOnClick = item.getAttribute("onClick");
      try {
        if (!!currentOnClick) {
          if (currentOnClick.trim().length > 0) {
            if (currentOnClick.trim().indexOf(`AttendanceRecordsWeekly.asp?WeekStart=`) > -1) {

              const onClickExtractedValue = `${currentOnClick}`.split(`return false;`).join('');
              let dateRangeValueArray = [];
              let statusText = "";

              try {
                const currentInnerHTML = item.innerHTML.trim();
                const innerHTMLSplit = currentInnerHTML.split(" ").map((item_2) => item_2.trim()).filter((item_2) => item_2.toLowerCase() !== "to");
                if (innerHTMLSplit.length === 2) {
                  dateRangeValueArray = innerHTMLSplit; //set date range array
                }
              } catch (e) {
                console.error("error with set dateRangeValueArray");
                console.error(e);
              }

              try {
                if (!!item.parentNode) {
                  if (!!item.parentNode.nextSibling) {
                    if (!!item.parentNode.nextSibling.innerHTML) {
                      const statusInnerHTML = item.parentNode.nextSibling.innerHTML.trim();
                      statusInnerHTML.split(">").join("|").split("<").join("|").split("|").map((item_2) => {
                        if (arrayOfAttendanceStatuses.indexOf(`${item_2}`.trim().toLowerCase()) > -1) {
                          statusText = `${item_2}`.trim();  //set status text
                        }
                      });
                    }
                  }
                }
              } catch (e) {
                console.error("error with set statusText");
                console.error(e);
              }

              //append values to arrays
              attendanceWeekDateRangeLinks.push(onClickExtractedValue);
              attendanceDateRangeValues.push(dateRangeValueArray);
              attendanceDateRangeStatuses.push(statusText);

            }
          }
        }
      } catch(e) {
        console.error("some stray error with waitForTeamAttendanceMainForm!");
        console.error(e);
      }
    });

    let blContinueToGetAttendanceValues = false;
    if (attendanceWeekDateRangeLinks.length > 0 ) {
      if (attendanceWeekDateRangeLinks.length === attendanceDateRangeValues.length) {
        if (attendanceWeekDateRangeLinks.length === attendanceDateRangeStatuses.length) {
          blContinueToGetAttendanceValues = true;
        } else {
          console.log("attendanceWeekDateRangeLinks.length === attendanceDateRangeStatuses.length mismatch");
        }
      } else {
        console.log("attendanceWeekDateRangeLinks.length === attendanceDateRangeValues.length mismatch");
      }
    } else {
      console.log("no attendance dates found - no attendance data to get");
    }
    if (blContinueToGetAttendanceValues === true) {
      console.log("continuing to get attendance data");
      navigateToAttendanceWeekMainForm(teamIds,intIndex,teamDetails,schedulesFound,participantsFound,attendanceWeekDateRangeLinks,attendanceDateRangeValues,attendanceDateRangeStatuses,[],0);
    } else {
      console.log("navigating to next team");
      navigateToTeamDetailsPage(teamIds, parseInt(intIndex) + 1);
    }
  } else {
    setTimeout(() => {
      console.log(`waiting for activity attendance page to load for team id ${teamIds[intIndex]}...`);
      waitForActivityAttendancePage(teamIds, intIndex, teamDetails,schedulesFound,participantsFound);
    }, pageTimeoutMilliseconds);
  }
};

const navigateToAttendanceWeekMainForm = (teamIds, intIndex, teamDetails,schedulesFound,participantsFound,attendanceWeekDateRangeLinks,attendanceDateRangeValues,attendanceDateRangeStatuses,currentAttendanceData,intWeekIndex) => {
  if (intWeekIndex < attendanceWeekDateRangeLinks.length) {
    console.log(`navigating to week ${intWeekIndex + 1} of ${attendanceWeekDateRangeLinks.length} for team ${intIndex + 1} of ${teamIds.length}`);
    top.DoLinkSubmit(attendanceWeekDateRangeLinks[intWeekIndex].split(`top.DoLinkSubmit('`).join('').split(`');`).join(''));
    waitForAttendanceWeekMainForm(teamIds, intIndex, teamDetails,schedulesFound,participantsFound,attendanceWeekDateRangeLinks,attendanceDateRangeValues,attendanceDateRangeStatuses,currentAttendanceData,intWeekIndex);
  } else {

    resultsLog.push({
      details:teamDetails,
      schedule:schedulesFound,
      enrollment:participantsFound,
      attendance:currentAttendanceData,
      browserDate: new Date().toISOString(),
      instanceDate,
      district:`district_1`,
    });
    console.log("no more attendance weeks for this team - continuing to next team");
    navigateToTeamDetailsPage(teamIds, parseInt(intIndex) + 1);
  }
};

const waitForAttendanceWeekMainForm = (teamIds, intIndex, teamDetails,schedulesFound,participantsFound,attendanceWeekDateRangeLinks,attendanceDateRangeValues,attendanceDateRangeStatuses,currentAttendanceData,intWeekIndex) => {
  if (isOnAttendanceWeekMainForm(attendanceWeekDateRangeLinks[intWeekIndex])) {

    let attendanceTableHeader = null;
    let attendanceTableHeaderValues = [];
    let extractedAttendanceDataArray = [];

    convertHTMLCollectionToArray(getPageElementsByTagName(`thead`)).map((item) => {
      if (!!item.childNodes) {
        if (!!item.childNodes.length > 0) {
          convertHTMLCollectionToArray(item.childNodes).map((item_2) => {
            if (!!item_2.childNodes) {
              if (!!item_2.childNodes.length > 0) {
                const theadElements = convertHTMLCollectionToArray(item_2.childNodes).filter((item_3) => {
                  return !!item_3.nodeName && item_3.nodeName === "TH";
                });
                if (theadElements.length === 8) {
                  if (theadElements[0].innerHTML.trim() === "Name") {
                    attendanceTableHeader = item;
                    theadElements.map((item) => {
                      attendanceTableHeaderValues.push(item.innerHTML.trim());
                    });
                  }
                }
              }
            }
          });
        }
      }
    });

    if (!!attendanceTableHeader && attendanceTableHeaderValues.length === 8) {
      const attendanceTableBody = attendanceTableHeader.nextSibling.nextSibling;
      if (!!attendanceTableBody) {
        if (!!attendanceTableBody.childNodes) {
          if (!!attendanceTableBody.childNodes.length > 0) {
            convertHTMLCollectionToArray(attendanceTableBody.childNodes).map((item_2) => {
              if(item_2.nodeName === "TR") {
                if (!!item_2.childNodes) {
                  const tableElements = convertHTMLCollectionToArray(item_2.childNodes).filter((item_3) => {
                    return item_3.nodeName === "TD";
                  });
                  if (tableElements.length === attendanceTableHeaderValues.length) {
                    const attendanceDataForRow = tableElements.map((item_3) => {
                      if (!!item_3.childNodes) {
                        if (item_3.childNodes.length > 0) {
                          if (item_3.childNodes.length === 1) {
                            if (item_3.childNodes[0].nodeName === "#text") {
                              return item_3.childNodes[0].textContent;   //person's name
                            }
                          }
                          if (item_3.childNodes.length === 3) {
                            if (item_3.childNodes[0].nodeName === "#text" && item_3.childNodes[1].nodeName === "DIV" && item_3.childNodes[2].nodeName === "#text") {
                              if (!!item_3.childNodes[1].childNodes) {
                                if (item_3.childNodes[1].childNodes.length  === 5) {
                                  if (item_3.childNodes[1].childNodes[1].nodeName === "LABEL" && item_3.childNodes[1].childNodes[3].nodeName === "LABEL") {
                                    const presentButtonClassList = convertHTMLCollectionToArray(item_3.childNodes[1].childNodes[1].classList);
                                    const absentButtonClassList = convertHTMLCollectionToArray(item_3.childNodes[1].childNodes[3].classList);
                                    if (presentButtonClassList.indexOf("btn-p") > -1) {
                                      if (absentButtonClassList.indexOf("btn-a") > -1) {
                                        const blPresentButtonChecked = presentButtonClassList.indexOf(`jcf-label-active`) > -1;
                                        const blAbsentButtonChecked = absentButtonClassList.indexOf(`jcf-label-active`) > -1;
                                        return blPresentButtonChecked === true ? "Present" : blAbsentButtonChecked === true ? "Absent" : "Not Set";
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                      return null;
                    }).map((item_3) => typeof item_3 === "string" ? item_3.trim().split('\n\t').join('').trim().length > 0 ? item_3 : null : item_3);
                    let extractedAttendanceDataObj = {};
                    attendanceDataForRow.map((item_3, index_3) => {
                      if (!!item_3) {
                        extractedAttendanceDataObj[attendanceTableHeaderValues[index_3]] = item_3;
                      }
                    });

                    if (!!extractedAttendanceDataObj.Name) {
                      Object.keys(extractedAttendanceDataObj).map((item_3) => {
                        if (item_3 !== "Name") {
                          extractedAttendanceDataArray.push({
                            name:extractedAttendanceDataObj.Name,
                            date:item_3,
                            value:extractedAttendanceDataObj[item_3]
                          })
                        }
                      })
                    }
                  } else {
                    console.error("tableElements.length === attendanceTableHeaderValues.length mismatch");
                  }
                }
              }
            });
          }
        }
      }
    }

    console.log(`found ${extractedAttendanceDataArray.length} attendance records`);

    const foundAttendanceData = {
      date_range:attendanceDateRangeValues[intWeekIndex],
      status:attendanceDateRangeStatuses[intWeekIndex],
      attendance_data:extractedAttendanceDataArray
    };

    let newAttendanceUpdatedValues = currentAttendanceData;
    newAttendanceUpdatedValues.push(foundAttendanceData);

    console.log('navigating to next attendance week');
    navigateToAttendanceWeekMainForm(teamIds, intIndex, teamDetails,schedulesFound,participantsFound,attendanceWeekDateRangeLinks,attendanceDateRangeValues,attendanceDateRangeStatuses,newAttendanceUpdatedValues,parseInt(intWeekIndex) + 1);

  } else {
    setTimeout(() => {
      console.log("waiting for team participant attendance week form page to load...");
      waitForAttendanceWeekMainForm(teamIds, intIndex, teamDetails, schedulesFound, participantsFound, attendanceWeekDateRangeLinks, attendanceDateRangeValues, attendanceDateRangeStatuses, currentAttendanceData, intWeekIndex);
    }, pageTimeoutMilliseconds);
  }
};

const waitForActivityDetailsPage = (teamIds,intIndex) => {
  if (isOnActivityDetailsPageForCurrentTeam(teamIds[intIndex])) {
    const newObj = {};
    convertHTMLCollectionToArray(getPageElementsByClassName(youthParticipantsRegistrationPage_FormElementClassName)).map((item) => {
      if (!!item.children) {
        if (item.children.length === 2) {
          if (!!item.children[0].children) {
            if (item.children[0].children.length > 0) {
              if (!!item.children[0].children[0].innerHTML) {
                const currentLabelValue = item.children[0].children[0].innerHTML.trim();
                if (!!fieldLabelMapping[currentLabelValue]) {
                  if (!!item.children[1].children) {
                    if (item.children[1].children.length > 0) {
                      if (!!item.children[1].children[0].innerHTML) {
                        newObj[fieldLabelMapping[currentLabelValue]] = item.children[1].children[0].innerHTML;
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
        if (!!item.children) {
          if (item.children.length === 5) {
            if (!!item.children[0].children) {
              if (item.children[0].children.length > 0) {
                if (!!item.children[0].children[0].children) {
                  if (item.children[0].children[0].children.length > 1) {
                    const serviceDateIdValue =  item.children[0].children[0].children[1].getAttribute("value");
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
        console.log(`adding team schedule with ${updatedSchedulesFound.length} dates`);
        console.log('continuing to get enrollment information');
        top.DoLinkSubmit(`ActionSubmit~save; ; jump /Web/sms2/Services/EnrollmentList.asp?ServiceID=${teamIds[intIndex]};`);
        waitForActivityEnrollmentPage(teamIds,intIndex,teamDetails,updatedSchedulesFound);
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
  top.DoLinkSubmit(`ActionSubmit~save; ; jump /Web/sms2/Services/ServiceSchedule.asp?ServiceID=${teamIds[intIndex]};`);
  waitForActivitySchedulePage(teamIds, intIndex, teamDetails,[]);
};

const navigateToTeamDetailsPage = (teamIds,intIndex) => {
  if (intIndex < teamIds.length) {
    console.log(`navigating to team ${teamIds[intIndex]} - ${intIndex + 1} of ${teamIds.length}`);
    top.DoLinkSubmit(`ActionSubmit~save; ; jump /Web/sms2/Services/ServiceForm.asp?ServiceID=${teamIds[intIndex]};`);
    waitForActivityDetailsPage(teamIds,intIndex);
  } else {
    console.log(`DONE: ${new Date()}`);
    console.log(`no more team ids - done with getting details for all ${teamIds.length} teams`);
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

const waitForGroupActivitiesPageToLoad = () => {
  if (isOnActivitiesPage()) {
    gatherTeamDetails();
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
  if (isOnActivitiesPage()) {
    gatherTeamDetails();
  } else {
    console.log(`not starting on activities page - attempting to navigate via grants page...`);
    if (isOnGrantsPage()) {
      clickNewestGrantLink();
    } else {
      console.error(`not on grants page - cannot continue - please check`);
    }
  }
};

mainPageController();