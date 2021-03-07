import queryDocuments from "../mongo/query";
import runMulesoftAPIRequest_POST from "../modules/runMulesoftAPIRequest_POST";
import generateMulesoftAPIEndpoint_attendances_post from "../modules/generateMulesoftAPI_attendances_post";

const maxRequestsPerPayload = 20;

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
          const StudentId = item?.salesforceData?.Id;
          const SessionId = item?.matchingSFSession?.SessionId;
          const Attended = item?.matchingAttendanceValues?.AttendanceValue;
          if (!!StudentId && !!SessionId && !!Attended) {
            const blAttended = Attended.toLowerCase() === "present";
            return {
              StudentId,
              SessionId,
              Attended:blAttended
            };
          } else {
            console.error(`"StudentId=item.salesforceData.Id", "SessionId=item.matchingSFSession.SessionId" or "Attended=item.matchingAttendanceValues.AttendanceValue" fields not found - ${JSON.stringify(item)}`);
          }
          return null;
        }).filter((item) => !!item);
        const arraysChunked = chunkArray(singleRequestObject);
        console.log(`Split into ${arraysChunked.length} request chunks`);
        resolve(Promise.all(arraysChunked.map(async (item, index) => {
          return new Promise((resolve_2) => {
            setTimeout(async () => {
              try {
                console.log(`attendance ${index + 1} of ${arraysChunked.length} ${parseInt((index+1)/arraysChunked.length*100)}%`);
                resolve_2(await runMulesoftAPIRequest_POST(generateMulesoftAPIEndpoint_attendances_post(), "api/attendances", requestDate, item));
              } catch (e) {
                resolve(null);
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