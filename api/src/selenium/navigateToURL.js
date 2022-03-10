const navigateToURL = (browser, pageURL) => {
  return new Promise(async (resolve) => {
    console.log(`Navigating to URL : ${pageURL}`);
    try {
      const newURLObj = new URL(`${pageURL.indexOf(`http`) === -1 ? `http://` : ""}${pageURL}`);
      await browser.get(newURLObj)
      resolve(true);
    } catch (e) {
      console.error(`Error navigating to URL : ${pageURL}`);
      console.error(e);
      resolve(false);
    }
  });
};

export default navigateToURL;