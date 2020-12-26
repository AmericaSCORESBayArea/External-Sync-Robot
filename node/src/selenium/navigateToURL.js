const navigateToURL = (browser, pageURL) => {
  console.log(`navigating to ${pageURL}`);
  return new Promise(async (resolve) => {
    try {
      const newURLObj = new URL(`${pageURL.indexOf(`http`) === -1 ? `http://` : ""}${pageURL}`);
      await browser.get(newURLObj)
      resolve(true);
    } catch (e) {
      console.error("error navigating to URL");
      console.error(e);
      resolve(false);
    }
  });
};

export default navigateToURL;