import { Builder } from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox';
import FirefoxProfile from "firefox-profile"

const url = `http://${process.env.SELENIUM_HOST}:${process.env.SELENIUM_PORT}`;

const timeout_milliseconds = 60*60*1000*5;   //5 hours

const createBrowser = () => {
  console.log(`creating a browser instance...`);
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`Connecting to Selenium Server : ${url}`);
      const profile = new FirefoxProfile();
      profile.setAcceptUntrustedCerts(true);
      profile.setAssumeUntrustedCertIssuer(false);
      profile.setPreference("security.OCSP.enabled",0)
      profile.setPreference("security.OCSP.require",false)
      profile.setPreference("security.ssl.enable_ocsp_stapling",false)
      profile.setPreference("security.mixed_content.block_active_content",false)
      profile.setPreference("dom.allow_scripts_to_close_windows",true)

      const encodedProfile = new Promise(async (resolve_2) => {
        profile.encode((err, encodedProfile) => {
          if (err) {
            console.error("error encoding profile")
            console.error(err)
            reject(err);
          }
          resolve_2(encodedProfile)
        });
      });
      const firefoxOptions = new firefox.Options();
      firefoxOptions.setAcceptInsecureCerts(true)
      firefoxOptions.set("firefox_profile", encodedProfile)
      firefoxOptions.set("timeouts", {
        implicit: timeout_milliseconds,
        pageLoad:timeout_milliseconds,
        script: timeout_milliseconds
      })
      resolve(new Builder()
        .forBrowser("firefox")
        .usingServer(url)
        .setFirefoxOptions(firefoxOptions)
        .build()
      );
    } catch (e) {
      console.error(`Timeout waiting to connect to Selenium Server`);
      console.error(e);
      reject(e);
    }
  });
};

export default createBrowser;