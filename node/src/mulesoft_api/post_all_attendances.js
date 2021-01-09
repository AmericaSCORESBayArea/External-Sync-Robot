import queryDocuments from "../mongo/query";
import runMulesoftAPIRequest_POST from "../modules/runMulesoftAPIRequest_POST";
import generateMulesoftAPIEndpoint_attendances_post from "../modules/generateMulesoftAPI_attendances_post";

const maxRequestsPerPayload = 100;

const chunkArray = (arr) =>
  arr.length > maxRequestsPerPayload
    ? [arr.slice(0, maxRequestsPerPayload), ...chunkArray(arr.slice(maxRequestsPerPayload), maxRequestsPerPayload)]
    : [arr];

const post_all_attendances = async () => {
  const requestDate = new Date();
  return await new Promise(async (resolve, reject) => {
    try {
      console.log(`Starting Post All Attendance...`);
      const studentAttendances = await queryDocuments(`mulesoft_api_responses_attendances_view`, {});
      if (!!studentAttendances && studentAttendances.length > 0) {
        console.log(`Count : ${studentAttendances.length} Student Attendances in Salesforce...`);
        const singleRequestObject = studentAttendances.map((item) => {
          const {CoachSoccer, TeamSeasonId, SessionId, AttendanceValue, StudentId} = item;
          if (!!CoachSoccer && !!TeamSeasonId && !!SessionId && !!AttendanceValue && !!StudentId) {
            const blAttended = AttendanceValue.toLowerCase() === "present";
            return {
              coachId: CoachSoccer,
              teamSeasonId: TeamSeasonId,
              sessionId: SessionId,
              Attended: blAttended,
              StudentId
            };
          } else {
            console.error(`CoachSoccer, TeamSeasonId, SessionId, AttendanceValue or StudentId fields not found - ${JSON.stringify(item)}`);
          }
          return null;
        }).filter((item) => !!item);
        const arraysChunked = chunkArray(singleRequestObject);
        console.log(`Split into ${arraysChunked.length} request chunks`);
        resolve(Promise.all(arraysChunked.map(async (item, index) => {
          return new Promise((resolve_2, reject_2) => {
            setTimeout(async () => {
              try {
                resolve_2(await runMulesoftAPIRequest_POST(generateMulesoftAPIEndpoint_attendances_post(item[0].coachId, item[0].teamSeasonId, item[0].sessionId), "api/coach/[coachId]/teamseasons/[teamSeasonId]/sessions/[sessionId]/attendances", requestDate, item));
              } catch (e) {
                reject_2(e);
              }
            }, 200 * (index + 1));
          });
        })));
      } else {
        console.error("No Attendance Data Found to Post");
        resolve("No Attendance Data Found to Post");
      }
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};

export default post_all_attendances;