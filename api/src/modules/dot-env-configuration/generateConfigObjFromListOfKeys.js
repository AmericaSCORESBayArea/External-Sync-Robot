import configuration from "../../config";
const generateConfigObjFromListOfKeys = (listOfConfigKeys) => {
  if (!!configuration && !!configuration.parsed) {
    if (!!listOfConfigKeys) {
      if (Array.isArray(listOfConfigKeys)) {
        let configValuesObj = {};
        listOfConfigKeys.map((item) => !!configuration.parsed[item] && !!configuration.parsed[item] ? configValuesObj[item] = configuration.parsed[item].split("|") : null);
        const keysFound = Object.keys(configValuesObj);
        if (keysFound.length > 0 && keysFound.length === listOfConfigKeys.length) {
          let expectedLength = configValuesObj[keysFound[0]].length;
          if (expectedLength > 0) {
            const blMatchingConfigLengths = keysFound.filter((item) => configValuesObj[item].length === expectedLength).length === keysFound.length;
            if (blMatchingConfigLengths) {
              let returnMappedArray = [];
              Array.apply(null, Array(expectedLength)).map((item, index) => {
                let currentObj = {};
                keysFound.map((item_2) => currentObj[item_2] = decodeURIComponent(configValuesObj[item_2][index]));
                returnMappedArray.push(currentObj);
              });
              return returnMappedArray;
            }
          }
        }
      }
    }
  }
  return null;
};

export default generateConfigObjFromListOfKeys;