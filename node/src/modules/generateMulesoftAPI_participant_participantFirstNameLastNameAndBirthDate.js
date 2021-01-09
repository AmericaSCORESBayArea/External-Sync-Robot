import getConfigurationValueByKey from "./getConfigurationValueByKey";

const generateMulesoftAPI_participant_participantFirstNameLastNameAndBirthDate = (participantName,participantDateOfBirth) => {
  const nameSplit = participantName.split(',').map((item) => item.trim());
  if (nameSplit.length === 2) {
    const dateOfBirthSplit = participantDateOfBirth.split("/").map((item) => item.trim()).map((item) => item.length === 1 ? `0${item}` : item);
    if (dateOfBirthSplit.length === 3) {
      const firstName = encodeURIComponent(nameSplit[1]);
      const lastName = encodeURIComponent(nameSplit[0]);
      const dobYear = dateOfBirthSplit[2];
      const dobMonth = dateOfBirthSplit[0];
      const dobDay = dateOfBirthSplit[1];
      const apiDOB = `${dobYear}-${dobMonth}-${dobDay}`;
      return `${getConfigurationValueByKey("MULESOFT_API_ROOT_URL")}/contacts?dcyfId&firstName=${firstName}&lastName=${lastName}&birthDate=${apiDOB}`;
    } else {
      console.error(`cannot extract Date of Birth from ${participantDateOfBirth}`);
    }
  } else {
    console.error(`cannot extract First Name + Last Name from ${participantName}`);
  }
  return null;
};

export default generateMulesoftAPI_participant_participantFirstNameLastNameAndBirthDate;