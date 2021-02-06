import fs from "fs";
import getConfigurationValueByKey from "./getConfigurationValueByKey";

const scriptRootFolder = getConfigurationValueByKey("BROWSER_SCRIPT_RELATIVE_FOLDER_ROOT");

const getTextFileContent = (relativeScriptFolderFilePath) => {
  return new Promise(async (resolve) => {
    try {
      const scriptFileAbsoluteLocation = `${scriptRootFolder}/${relativeScriptFolderFilePath}`;
      console.log(`....getting the file content from : ${scriptFileAbsoluteLocation}`);
      const fileContent = await new Promise(async (resolve, reject) => fs.readFile(scriptFileAbsoluteLocation, "utf8", (err, data) => !!err ? reject(err) : resolve(data)));
      resolve(fileContent);
    } catch(e) {
      console.error(`error reading script file content`);
      console.error(e);
      resolve(null);
    }
  });
};

export default getTextFileContent;