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
        console.log(`Data Count : ${studentAttendances.length} Student Attendances in Salesforce...`);
        const singleRequestObject = studentAttendances.map((item) => {
          const StudentId = item?.salesforceData?.Id;
          const SessionId = item?.matchingSFSession?.SessionId;
          const Attended = item?.matchingAttendanceValues?.AttendanceValue;
          if (!!StudentId && !!SessionId && !!Attended) {
            const blAttended = Attended.toLowerCase() === "present";
            return {
              id: item._id,
              StudentId,
              SessionId,
              Attended: blAttended
            };
          } else {
            console.error(`"StudentId=item.salesforceData.Id", "SessionId=item.matchingSFSession.SessionId" or "Attended=item.matchingAttendanceValues.AttendanceValue" fields not found - ${JSON.stringify(item)}`);
          }
          return null;
        }).filter((item) => !!item);

        let arrayOfDocumentIds = [];
        const uniqueRequestsWithAllValues = singleRequestObject.map((item) => {
          const {id, StudentId, SessionId, Attended} = item;
          arrayOfDocumentIds.push(id);
          return JSON.stringify({
            StudentId,
            SessionId,
            Attended
          });
        }).filter((item, index, arr) => {
          return arr.indexOf(item) === index
        }).map((item) => JSON.parse(item));

        const mismatchedAttendanceValue = uniqueRequestsWithAllValues.filter((item, index) => {
          return uniqueRequestsWithAllValues.filter((item_2, index_2) => {
            if (index !== index_2) {
              if (item.StudentId === item_2.StudentId) {
                if (item.SessionId === item_2.SessionId) {
                  if (item.Attended !== item_2.Attended) {
                    console.error(`ATTENDANCE MISMATCH FOUND : document ids ${arrayOfDocumentIds[index]} at index=${index}vs ${arrayOfDocumentIds[index_2]} at index_2=${index_2}`);
                    console.error(item);
                    console.error(item_2);
                    return true;
                  }
                }
              }
            }
            return false;
          }).length > 0;
        });
        const uniqueParticipantsMismatched = mismatchedAttendanceValue.map((item) => item.StudentId).filter((item, index, arr) => arr.indexOf(item) === index);
        const uniqueSessionMismatched = mismatchedAttendanceValue.map((item) => item.SessionId).filter((item, index, arr) => arr.indexOf(item) === index);
        const uniqueRequestData = uniqueRequestsWithAllValues.filter((item) => uniqueParticipantsMismatched.indexOf(item.StudentId) === -1 && uniqueSessionMismatched.indexOf(item.SessionId) === -1);
        const arraysChunked = chunkArray(uniqueRequestData);
        console.log(`Mismatched attendance count : ${mismatchedAttendanceValue.length}`);
        console.log(`Unique participants with mismatched data : ${uniqueParticipantsMismatched.length}`);
        console.log(`Unique sessions with mismatched data : ${uniqueSessionMismatched.length}`);
        console.log(`Unique requests without mismatched attendance values : ${uniqueRequestData.length} vs ${uniqueRequestsWithAllValues.length}`);
        console.log(`Splitting requests into ${arraysChunked.length} batches with up to ${maxRequestsPerPayload} attendance records per request batch`);
        resolve(Promise.all(arraysChunked.map(async (item, index) => {
          return new Promise((resolve_2) => {
            setTimeout(async () => {
              try {
                console.log(`attendance ${index + 1} of ${arraysChunked.length} ${parseInt((index + 1) / arraysChunked.length * 100)}%`);
                resolve_2(await runMulesoftAPIRequest_POST(generateMulesoftAPIEndpoint_attendances_post(), "api/attendances", requestDate, item));
              } catch (e) {
                resolve(null);
              }
            }, 5000 * (index + 1));
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