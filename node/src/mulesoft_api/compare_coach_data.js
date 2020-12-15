// import establishDatabaseConnection from "../mongo/establishDatabaseConnection";

import {db} from "../mongo/establishDatabaseConnection";
import queryDocuments from "../mongo/query";

const axios = require('axios');
// require('dotenv').config();
//
// console.log(process.env);
//
//
// const runGetCoachData = async (db) => {
//
//   console.log("HERE");
//   console.log(db);
//
//   return true;
//
//
//
// };
//
// establishDatabaseConnection(runGetCoachData);



// const dotenv = require('dotenv');
// console.log(dotenv.config());
//
// const prommie = new Promise();

// //All Coach Ids - exported from America Scores SalesForce
// const coachIdArray = [
//   "0031T00003OclmQQAR",
//   "0031T00004E1FTjQAN",
//   "0031T00003OcgM4QAJ",
//   "0031T00003OcljGQAR",
//   "0031T00003OcshDQAR",
//   "0031T00003OcshEQAR",
//   "0031T00003QCZNZQA5",
//   "0031T00003QCZGkQAP",
//   "0031T00003QCYLTQA5",
//   "0031T00003QCZGfQAP",
//   "0031T00003QCZRqQAP",
//   "0031T00003QCjRKQA1",
//   "0031T00003QCjPEQA1",
//   "0031T00003OcejiQAB",
//   "0031T00003OcgLaQAJ",
//   "0031T00003OcgOoQAJ",
//   "0031T00003Oct1fQAB",
//   "0031T00003OcgL6QAJ",
//   "0031T00003OcdAKQAZ",
//   "0031T00003OceaYQAR",
//   "0031T00003OclmuQAB",
//   "0031T00003M1IyxQAF",
//   "0031T00003M10OTQAZ",
//   "0031T00003M0vpLQAR",
//   "0031T00003M0zdwQAB",
//   "0031T00003M0yFGQAZ",
//   "0031T00003M0zeBQAR",
//   "0031T00003M0zeGQAR",
//   "0031T00003M2XNwQAN",
//   "0031T00003M0vsKQAR",
//   "0031T00003M10P7QAJ",
//   "0031T00003M0yEwQAJ",
//   "0031T00003OceaxQAB",
//   "0031T00003OczE9QAJ",
//   "0031T00003M1V9yQAF",
//   "0031T00003M1IR6QAN",
//   "0031T00003M1IDiQAN",
//   "0031T00003M1IDnQAN",
//   "0031T00003M1IDTQA3",
//   "0031T00003M0yF1QAJ",
//   "0031T00003M0yErQAJ",
//   "0031T00003M10LFQAZ",
//   "0031T00003M10NBQAZ",
//   "0031T00003QCN6BQAX",
//   "0031T00003M0yFBQAZ",
//   "0031T00003M0yFfQAJ",
//   "0031T00004ATjBsQAL",
//   "0031T00004CZdqfQAD",
//   "0031T00004CYY7NQAX"
// ];
//
//
// const headers = {
//   "client_id": "5748ed031a9b490f9c66ae5f26ee059d",
//   "client_secret": "BbB91eEe28544c9880f757ad648dbe0e"
// };
//
//
// Promise.all(coachIdArray.map((item) => {
//
//   return new Promise(async () => {
//     const requestURI = `https://salesforce-data-api-proxy.us-e2.cloudhub.io/api/coach/${item}/all?date=2019-08-21`;
//     const results = await axios.get(`${requestURI}`, {headers});
//
//     console.log(results);
//
//   })
// }))
//   .catch((err) => {
//     console.error(err);
//   })
//   .then((res,err) => {
//     console.log(res);
//     console.log(err);
// });




// //get the current index of the test
// let item = pm.globals.get("itemOfCoachIdArray");
//
// console.log("CURRENT INDEX : ");
// console.log(item);
//
// console.log("CURRENT COACH ID : ");
// console.log(coachIdArray[item]);
//
// //sets the current coachId to enter into the request
// pm.globals.set("varCoachId", coachIdArray[item]);
//
//
//
// pm.environment.clear();
//
//
// let item = pm.globals.get("itemOfCoachIdArray");
//
// pm.globals.set("itemOfCoachIdArray", Number(item) + 1);
//
// let jsonData = pm.response.json();
//
// pm.test("Status code is 200", function () {
//   pm.response.to.have.status(200);
// });
//
// console.log(JSON.stringify(jsonData));
//
// // // Output only in case of condition
// // if (jsonData.accessInfo.viewability !== "NO_PAGES") {
// // 	// Case of output #1 - in Postman console
// // 	console.log(`${jsonData.id} is ${jsonData.accessInfo.viewability}`);
//
// //     // Case of output #2 - in Postman variable
// //     // Additional variable to avoid "undefined" previous data on the first iteration
//
// //     let previousResponse = (pm.globals.get("resposeData") === undefined) ? '' : `${pm.globals.get("resposeData")}, `;
//
// //     // Represent output as a key:value data
// //     pm.globals.set("resposeData", `${previousResponse}"${jsonData.id}": "${jsonData.accessInfo.viewability}"`);
//
// // }



const compare_coach_data = async () => {
  return new Promise(async (resolve,reject) => {
    try {
      console.log(`Starting Get Coach Data Command...`);
      console.log("HERE");
      // console.log(db);

      const data = await queryDocuments(`district_1_participants`, {});

      console.log(data);



      resolve(true);
    } catch(e) {
      reject(e);
    }
  });
};

export default compare_coach_data;