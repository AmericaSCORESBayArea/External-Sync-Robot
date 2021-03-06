const fs = require('fs');
import queryDocuments from "../mongo/query";
import getCLIArguments from "../modules/getCLIArguments";

const compare_salesforce_export_and_district_enrollments = async () => {
  return await new Promise(async (resolve, reject) => {
    try {
      const cliArguments = getCLIArguments();
      const mongoQuery = cliArguments.length > 1 ? JSON.parse(cliArguments[1]) : {};
      console.log(`Starting Compare Salesforce and District Enrollments... ${new Date()}`);
      console.log(`Query: `);
      console.log(mongoQuery);
      const districtEnrollments = await queryDocuments(`district_participant_activity_view`, mongoQuery);
      if (districtEnrollments.length > 0) {
        console.log(`Found ${districtEnrollments.length} district enrollments`);
        const salesforceEnrollments = await queryDocuments(`salesforce_enrollment_export_view`, mongoQuery);
        if (salesforceEnrollments.length > 0) {
          console.log(`Found ${salesforceEnrollments.length} salesforce enrollments`);
          const enrollmentsInSFNotInDistrict = salesforceEnrollments.filter((item) => {
            return districtEnrollments.filter((item_2) => {
              return item.fullName_districtTeamName === item_2.fullName_districtTeamName;
            }).length === 0;
          });

          const enrollmentsInDistrictNotInSF = districtEnrollments.filter((item) => {
            return salesforceEnrollments.filter((item_2) => {
              return item.fullName_districtTeamName === item_2.fullName_districtTeamName;
            }).length === 0;
          });
          console.log(`Enrollments in SF but not in District: ${enrollmentsInSFNotInDistrict.length}`);
          console.log(`Enrollments in District but not in SF: ${enrollmentsInDistrictNotInSF.length}`);
          await fs.writeFileSync("../enrollmentsInSFNotInDistrict.json", JSON.stringify(enrollmentsInSFNotInDistrict), (err) => {
            if (err)
              console.log(err);
            else {
              console.log("File written successfully enrollmentsInSFNotInDistrict.json\n");
            }
          });
          await fs.writeFileSync("../enrollmentsInDistrictNotInSF.json", JSON.stringify(enrollmentsInDistrictNotInSF), (err) => {
            if (err)
              console.log(err);
            else {
              console.log("File written successfully enrollmentsInDistrictNotInSF.json\n");
            }
          });
        } else {
          console.error("No Salesforce enrollments found");
          resolve("No Salesforce enrollments found");
        }
      } else {
        console.error("No District enrollments found");
        resolve("No District enrollments found");
      }
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};

export default compare_salesforce_export_and_district_enrollments;