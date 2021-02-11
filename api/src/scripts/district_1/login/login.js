const pageTimeoutMilliseconds = 2000;

const fillInLoginElements = () => {
  const inputElements = document.getElementsByClassName("inputBox");
  const submitElements = document.getElementsByName("submitLogin");
  if (inputElements.length > 0 && submitElements.length > 0) {
    if (inputElements[1].type === `password`) {
      const userNameInput = inputElements[0];
      const passwordInput = inputElements[1];
      const submitButton = submitElements[0];
      userNameInput.value = `!REPLACE_USERNAME`;
      passwordInput.value = `!REPLACE_PASSWORD`;
      setTimeout(() => {
        console.log("clicking login...");
        submitButton.click();
        setTimeout(() => {
          console.log("running callback...");
          arguments[arguments.length - 1](true);
        }, pageTimeoutMilliseconds);
      }, pageTimeoutMilliseconds);
    }
  } else {
    console.log("waiting for login elements to load...");
    setTimeout(() => {
      fillInLoginElements();
    }, pageTimeoutMilliseconds);
  }
};

fillInLoginElements();