const getCLIArguments = () => {
  try {
    return process.argv.slice(2);
  } catch (e) {
    console.error("error getting CLI arguments");
    console.error(e);
  }
  return [];
};

export default getCLIArguments;