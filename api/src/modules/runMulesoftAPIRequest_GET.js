import http from "./runHTTPRequest";
import mulesoftAPIHeaders from "./generateMulesoftAPIHeaders";
import insertOneDocument from "../mongo/insertOne";
import getConfigurationValueByKey from "./dot-env-configuration/getConfigurationValueByKey";

const runMulesoftAPIRequest_GET = (endpointURL, requestType, requestDate, parameters) => {
  return new Promise(async (resolve, reject) => {
    const requestObj = {
      requestMethod:"GET",
      requestType,
      requestDate,
      parameters,
      endpointURL,
      rootURL:`${getConfigurationValueByKey(`MULESOFT_API_ROOT_URL`)}`,
      data:null,
      errorMessage:null
    };
    await http.get(endpointURL, {headers: mulesoftAPIHeaders}).then(async (res, err) => {
      if (!!err) {
        console.error(`Error encountered---1 for GET endpoint : ${endpointURL}`);
        console.error(err);
        requestObj.errorMessage=err;
        const newId = await insertOneDocument(`mulesoft_api_responses_errors`, requestObj);
        reject(newId);
      } else {
        console.log(`Data Retrieved for for GET endpoint : ${endpointURL}`);
        if (!!res.data && res.data.length > 0) {
          requestObj.data=res.data;
          const newId = await insertOneDocument(`mulesoft_api_responses`,requestObj);
          resolve(newId);
        } else {
          const errorMessage = `Error data not found in response object for GET endpoint : ${endpointURL}`;
          console.error(errorMessage);
          console.error(`with parameters : ${JSON.stringify(parameters)}`);
          requestObj.errorMessage=errorMessage;
          const newId = await insertOneDocument(`mulesoft_api_responses_errors`, requestObj);
          reject(newId);
        }
      }
    }).catch((err) => {
      console.error(err);
      reject(err);
    }).then(
      //do nothing
    );
  });
};

export default runMulesoftAPIRequest_GET;