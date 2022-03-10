const closeSeleniumBrowser = (browser) => {
  return new Promise(async (resolve) => {
    try {
      await browser.quit()
    } catch (e) {
      console.error("error closing browser");
      console.error(e);
    }
    resolve(true);
  });
};

export default closeSeleniumBrowser;