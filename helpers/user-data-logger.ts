import { createLogger, format, transports } from "winston";

const { combine, timestamp, label, prettyPrint } = format;

const userDataLogger = createLogger({
	format: combine(label({ label: "user-error" }), timestamp(), prettyPrint()),
	transports: [
		new transports.Console(),
		new transports.File({ filename: "user-data-log.log" }),
	],
});

export { userDataLogger };
