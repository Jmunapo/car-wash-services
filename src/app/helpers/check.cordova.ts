export const isDevice = () => {
  if (!(<any>window).cordova) {
    console.log("Please use a device");
    return false;
  }
  return true;
};
