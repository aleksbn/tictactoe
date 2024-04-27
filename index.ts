import mongoose from "mongoose";
import express, { NextFunction } from "express";
import http from "http";
import { Server } from "socket.io";
import config from "config";
import cors from "cors";

import users from "./routes/users";
import auth from "./routes/auth";
import games from "./routes/games";
import history from "./routes/history";
import generate from "./routes/generate";
import { serverLogger } from "./helpers/server-logger";
import { IError } from "./models/common";

process.on("uncaugthException", (ex) => {
	serverLogger.log("error", ex.message);
});

process.on("unhandledRejection", (ex: IError) => {
	serverLogger.log("error", ex.message);
});

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
	},
});

app.use(express.json());
app.use(cors());
app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/games", games);
app.use("/api/history", history);
app.use("/api/generate", generate);

io.on("connection", (socket) => {
	console.log(`User just connected. User ID: ${socket.id}`);

	socket.on("join", (data: { _id: string; isAgainstPC: boolean }) => {
		socket.join(data._id);
		const room = io.sockets.adapter.rooms.get(data._id);
		let numberOfMembers = room ? room.size : 0;
		if (data.isAgainstPC) numberOfMembers++;
		console.log(
			`Player just joined to the game of ID: ${data._id}. There are currently ${numberOfMembers} in the game.`
		);
		io.to(data._id).emit(
			"playerJoined",
			numberOfMembers === 2 ? "ongoing" : "waiting"
		);
	});

	socket.on("leave", (gameId: string) => {
		socket.leave(gameId);
		io.to(gameId).emit("playerLeft", "left");
	});

	socket.on("move", (data) => {
		if (data.winnerId) {
			io.to(data._id).emit("gamefinished", data);
		} else io.to(data._id).emit("next", data);
	});

	socket.on("disconnect", () => {
		console.log("user disconnected");
	});
});

if (!config.get("jwtPrivateKey")) {
	console.error("FATAL ERROR: jwt private key is not defined");
	process.exit(1);
}

mongoose.connect("mongodb://127.0.0.1/tictactoe").then(() => {
	console.log("Connected to MongoBD...");
});

const port = process.env.PORT || 3900;
server.listen(port, () => console.log(`Listening on port ${port}...`));
