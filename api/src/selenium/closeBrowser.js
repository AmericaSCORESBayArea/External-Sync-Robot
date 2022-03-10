const closeSeleniumBrowser = (browser) => {
  return new Promise(async (resolve) => {
    console.log("Closing the browser (if it didn't close itself)...")
    try {
      await browser.quit()
    } catch (e) {
      // do nothing
    }
    console.log("...done closing browser")
    resolve(true);
  });
};

export default closeSeleniumBrowser;