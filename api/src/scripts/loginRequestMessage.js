// noinspection JSAnnotator
return new Promise(async (resolve,reject) => {
  try {
    alert("Please Login...");
    setTimeout(() => {
      resolve(true);
    },1000);
  } catch(e) {
    reject(e);
  }
});