import { createLogger, format, transports } from "winston";

const { combine, timestamp, label, prettyPrint } = format;

const serverLogger = createLogger({
	format: combine(label({ label: "server-error" }), timestamp(), prettyPrint()),
	transports: [
		new transports.Console(),
		new transports.File({ filename: "server-log.log" }),
	],
});

export { serverLogger };
