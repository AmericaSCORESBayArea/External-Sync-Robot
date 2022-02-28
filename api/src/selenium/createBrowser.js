import {Builder} from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox';


// index.js
const capabilities = {
  build: 'NodeJS build',  // Name of the build
  name: 'Test 1',         // Name of the test
  platform: 'windows 10', // Name of Operating System
  browserName: 'chrome',  // Name of the browser
  version: '67.0',        // Version of the browser
  resolution: '1280x800', // Resolution of the screen
  network: true,          // Enable to capture browser network logs
  visual: true,           // Enable to capture screenshot on every command
  console: true,          // Enable to capture the console log
  video: true             // Enable to capture the video recording of the test
}

const createOptions = () => {
  const options = {};
  return new firefox.Options(options).setAcceptInsecureCerts(true);
};

const createBrowser = () => {
  console.log(`creating a browser instance...`);
  return new Promise(async (resolve, reject) => {
    try {
      const url = `http://${process.env.SELENIUM_HOST}:${process.env.SELENIUM_PORT}`;
      resolve(new Builder().usingServer(url).withCapabilities(capabilities).setFirefoxOptions(createOptions()).build());
    } catch(e) {
      console.error(`Timeout waiting to connect to Selenium Server`);
      console.error(e);
      reject(e);
    }
  });
};

export default createBrowser;