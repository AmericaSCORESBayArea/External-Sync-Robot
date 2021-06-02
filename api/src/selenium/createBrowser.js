import {Builder} from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox';

const createOptions = () => {
  const options = {};
  return new firefox.Options(options).setAcceptInsecureCerts(true);
};

const createBrowser = () => {
  console.log(`creating a browser instance...`);
  return new Promise(async (resolve, reject) => {
    try {
      resolve(await new Builder().forBrowser("firefox").setFirefoxOptions(createOptions()).build());
    } catch(e) {
      console.error(`error creating selenium browser object`);
      console.error(e);
      reject(e);
    }
  });
};

export default createBrowser;