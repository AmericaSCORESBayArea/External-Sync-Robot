import {mongoDBClientReference} from "./establishDatabaseConnection";

const closeDatabaseConnection = () => {
  try {
    mongoDBClientReference.close();
  } catch (e) {
    console.error("Error Closing Database Connection : ");
    console.error(e);
  }
}

export default closeDatabaseConnection;