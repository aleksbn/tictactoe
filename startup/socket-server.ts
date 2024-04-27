import http from "http";
import { Express } from "express";
import { Server } from "socket.io";

function createServer(app: Express) {
	const server = http.createServer(app);

	const io = new Server(server, {
		cors: {
			origin: "*",
			methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
		},
	});

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

	return server;
}

export { createServer };
