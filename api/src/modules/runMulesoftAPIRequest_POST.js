import http from "./runHTTPRequest";
import mulesoftAPIHeaders from "./generateMulesoftAPIHeaders";
import insertOneDocument from "../mongo/insertOne";
import getConfigurationValueByKey from "./dot-env-configuration/getConfigurationValueByKey";

const runMulesoftAPIRequest_POST = (endpointURL, requestType, requestDate, parameters) => {
  return new Promise(async (resolve, reject) => {
    await http.post(endpointURL, Array.isArray(parameters) ? parameters : {...parameters},{headers: mulesoftAPIHeaders,body:parameters}).then(async (res, err) => {
      if (!!err) {
        console.error(`Error encountered---1 for POST endpoint : ${endpointURL}`);
        console.error(err);
        reject(err);
      } else {
        console.log(`Data Retrieved for for POST endpoint : ${endpointURL}`);
        if (!!res.data && res.data.length > 0) {
          const newId = await insertOneDocument(`mulesoft_api_responses`, {
            requestMethod:"POST",
            requestType,
            requestDate,
            parameters,
            rootURL:`${getConfigurationValueByKey(`MULESOFT_API_ROOT_URL`)}`,
            data: res.data
          });
          resolve(newId);
        } else {
          console.error(`Error data not found in response object for POST endpoint : ${endpointURL}`);
          console.error(`with parameters : ${JSON.stringify(parameters)}`);
          resolve(null);
        }
      }
    }).catch((err) => {
      reject(err);
    }).then(
      //do nothing
    );
  });
};

export default runMulesoftAPIRequest_POST;