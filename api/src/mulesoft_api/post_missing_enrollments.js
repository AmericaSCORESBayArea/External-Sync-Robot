import queryDocuments from "../mongo/query";
import runMulesoftAPIRequest_POST from "../modules/runMulesoftAPIRequest_POST";
import generateMulesoftAPIEndpoint_enrollments_post from "../modules/generateMulesoftAPI_enrollments_post";

const post_missing_enrollments = async () => {
  const requestDate = new Date();
  return await new Promise(async (resolve, reject) => {
    try {
      console.log(`Starting Post Missing Enrollments...`);
      const missingStudentEnrollments = await queryDocuments(`mulesoft_api_responses_enrollments_missing_view`, {});
      if (!!missingStudentEnrollments && missingStudentEnrollments.length > 0) {
        console.log(`Count : ${missingStudentEnrollments.length} Missing Student Enrollments in Salesforce...`);
        resolve(Promise.all(missingStudentEnrollments.map(async (item, index) => {
          return new Promise((resolve_2,reject_2) => {
            setTimeout(async () => {
              const {studentId,teamSeasonId} = item;
              if (!!studentId && !!teamSeasonId) {
                console.log(`Running Post for ${index + 1} - ${studentId} - ${teamSeasonId}`);
                const postRequestFields = {
                  StudentId:studentId,
                  TeamSeasonId:teamSeasonId
                };
                try {
                  resolve_2(await runMulesoftAPIRequest_POST(generateMulesoftAPIEndpoint_enrollments_post(), "api/enrollments", requestDate, postRequestFields));
                } catch (e) {
                  reject_2(e);
                }
              } else {
                console.error(`studentId or teamSeasonId fields not found - ${JSON.stringify(item)}`);
              }
              resolve(false);
            }, 200 * (index + 1));
          });
        })));
      } else {
        console.error("No Missing Enrollments Found to Post");
        resolve("No Missing Enrollments Found to Post");
      }
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};

export default post_missing_enrollments;