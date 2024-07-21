import config from "config";

/**
 * Check the configuration for the presence of jwtPrivateKey.
 *
 * @return {void} Throws an error if jwtPrivateKey is not defined.
 */
function checkConfig() {
  if (!config.get("jwtPrivateKey")) {
    throw new Error("FATAL ERROR: jwt private key is not defined");
  }
}

export { checkConfig };
