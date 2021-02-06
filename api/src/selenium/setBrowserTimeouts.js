const implicit_timeout_milliseconds = 10000;
const pageLoad_timeout_milliseconds = 10000;
const script_timeout_milliseconds = 60*60*1000*5;   //5 hours
const timeoutObj = { implicit: implicit_timeout_milliseconds, pageLoad:pageLoad_timeout_milliseconds, script: script_timeout_milliseconds };

const setBrowserTimeouts = (browser) => {
  console.log(`setting browser timeouts to : ${JSON.stringify(timeoutObj)}`);
  return new Promise(async (resolve) => {
    try {
      await browser.manage().setTimeouts(timeoutObj)
      resolve(true);
    } catch(e) {
      console.error("error setting browser timeouts");
      console.error(e);
      resolve(false);
    }
  });
};

export default setBrowserTimeouts;