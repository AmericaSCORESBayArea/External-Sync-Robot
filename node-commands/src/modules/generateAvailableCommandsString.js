const generateAvailableCommandsString = (commandsArray) => `available commands : ${commandsArray.map((item, index) => `
    [${index + 1}] ${item.name}`).join("")}`;

export default generateAvailableCommandsString;