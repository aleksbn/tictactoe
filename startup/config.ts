import config from "config";

function checkConfig() {
	if (!config.get("jwtPrivateKey")) {
		throw new Error("FATAL ERROR: jwt private key is not defined");
	}
}

export { checkConfig };
