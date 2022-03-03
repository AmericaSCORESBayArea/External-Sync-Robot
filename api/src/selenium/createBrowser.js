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
      const url = `http://${process.env.SELENIUM_HOST}:${process.env.SELENIUM_PORT}`;
      console.log(`Attempting to connect to Selenium Server : ${url}`);
      resolve(new Builder().forBrowser("firefox").usingServer(url).setFirefoxOptions(createOptions()).build());
    } catch(e) {
      console.error(`Timeout waiting to connect to Selenium Server`);
      console.error(e);
      reject(e);
    }
  });
};

export default createBrowser;