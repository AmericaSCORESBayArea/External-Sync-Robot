const waitUntilLocation = async (browser,location) => {
  console.log(`waiting until location ${location}`);
  return new Promise(async (resolve) => {
    console.log(`Checking if location yet : ${location}`);
    const currentBrowserLocation = await browser.getCurrentUrl();
    if (currentBrowserLocation === location) {
      console.log(`...location match - continuing...`);
      resolve(true);
    } else {
      setTimeout(async () => {
        resolve(await waitUntilLocation(browser, location));
      }, 3000);
    }
  });
};

export default waitUntilLocation;