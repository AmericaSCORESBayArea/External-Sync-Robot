const closeSeleniumBrowser = (browser) => {
  return new Promise(async (resolve, reject) => {
    try {
      resolve(await browser.quit());
    } catch (e) {
      console.error("error closing browser");
      console.error(e);
      reject(e);
    }
  });
};

export default closeSeleniumBrowser;