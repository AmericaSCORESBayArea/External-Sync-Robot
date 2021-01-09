import {Builder} from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox';

const createBrowser = (options) => {
  console.log(`creating a browser instance...`);
  return new Promise(async (resolve, reject) => {
    try {
      let options = new firefox.Options(options);
      resolve(await new Builder().forBrowser("firefox").setFirefoxOptions(options).build());
    } catch(e) {
      console.error(`error creating selenium browser object`);
      console.error(e);
      reject(e);
    }
  });
};

export default createBrowser;