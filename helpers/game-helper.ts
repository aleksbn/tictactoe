import { Game, IGame } from "../models/entities/game";
import { Move } from "../models/entities/move";
import { GameResultDTO } from "../models/DTOs/gameResultDTO";
import UserDTO from "../models/DTOs/userDTO";
import HistoryItemDTO from "../models/DTOs/historyItemDTO";
import { UserModel } from "../models/mongoose/userModel";

type RandomMove = {
	xCoord: number;
	yCoord: number;
};

interface IFullGame extends IGame {
	_id: string;
}

// Provjera imamo li pobjednika (funkcija vraca X ako kreator igre pobjedjuje, odnosno O, ako drugi
// igrac pobjedjuje)
// Ovo ce na frontu biti prikazano dinamicki (nekad X, nekad O) kako bi korisnicima bilo zanimljivije
async function checkForWinner(game: Game) {
	const outcome = calculateOutcome(game);
	switch (outcome) {
		case "X":
			game.winnerId = game.creatorId;
			break;
		case "O":
			game.winnerId = game.isAgainstPC ? "PC" : game.opponentId!;
			break;
		default:
			break;
	}

	//Ako do sad nismo imali pobjednika, a potrosili smo sve poteze
	if (!game.winnerId && game.moves?.length === 9) {
		game.winnerId = "Draw";
		const result = new GameResultDTO("No winner, it's a draw!", 200);
		result.winnerId = "Draw";
		return result;
	}

	//Ako je pobjednik upisan u prethodnoj switch statement, a nije remi
	else if (game.winnerId && game.winnerId !== "Draw") {
		const winner =
			game.winnerId === "PC"
				? "PC"
				: (await UserModel.findById(game.winnerId))?.nickname;
		const result = new GameResultDTO(`...and the winner is ${winner}`, 200);
		result.winnerId = game.winnerId;
		return result;
	}

	//Ako nije ni remi ni pobjednik, znaci da potez nije odlucio pobjedu i igra nastavlja dalje
	else {
		return new GameResultDTO("Move played", 200);
	}
}

function pcMove(game: Game, playerId: string) {
	const matrix = fillMatrix(game);
	const availableMoves: RandomMove[] = getAvailableMoves(matrix);

	// Provjeri moze li PC da zavrsi
	for (const move of availableMoves) {
		const testMatrix = cloneMatrix(matrix);
		testMatrix[move.xCoord][move.yCoord] = "O";

		if (isWinningMove(testMatrix, "O")) {
			return new Move(playerId, move.xCoord, move.yCoord);
		}
	}

	// Provjeri moze li PC da blokira
	for (const move of availableMoves) {
		const testMatrix = cloneMatrix(matrix);
		testMatrix[move.xCoord][move.yCoord] = "X"; // Assume it's the player's move

		if (isWinningMove(testMatrix, "X")) {
			return new Move(playerId, move.xCoord, move.yCoord);
		}
	}

	// Generisi nasumicni potez
	const randomMove = getRandomMove(availableMoves);
	return new Move(playerId, randomMove.xCoord, randomMove.yCoord);
}

function cloneMatrix(matrix: string[][]): string[][] {
	return matrix.map((row) => row.slice());
}

function getRandomMove(moves: RandomMove[]): RandomMove {
	const randomIndex = Math.floor(Math.random() * moves.length);
	return moves[randomIndex];
}

function isWinningMove(matrix: string[][], symbol: string): boolean {
	// Testiraj redove, kolone ili dijagonale imamo li pobjednicki potez
	for (let i = 0; i < 3; i++) {
		if (
			(matrix[i][0] === symbol &&
				matrix[i][1] === symbol &&
				matrix[i][2] === symbol) ||
			(matrix[0][i] === symbol &&
				matrix[1][i] === symbol &&
				matrix[2][i] === symbol)
		) {
			return true;
		}
	}

	if (
		(matrix[0][0] === symbol &&
			matrix[1][1] === symbol &&
			matrix[2][2] === symbol) ||
		(matrix[0][2] === symbol &&
			matrix[1][1] === symbol &&
			matrix[2][0] === symbol)
	) {
		return true;
	}

	return false;
}

function getAvailableMoves(matrix: string[][]): RandomMove[] {
	const availableMoves: RandomMove[] = [];
	for (let x = 0; x < 3; x++) {
		for (let y = 0; y < 3; y++) {
			if (matrix[x][y] === "") {
				availableMoves.push({ xCoord: x, yCoord: y });
			}
		}
	}
	return availableMoves;
}

function printMatrixToConsole(matrix: string[][]) {
	console.log("Current matrix");
	console.log(matrix[0]);
	console.log(matrix[1]);
	console.log(matrix[2]);
}

function calculateOutcome(game: Game) {
	const matrix = fillMatrix(game);
	printMatrixToConsole(matrix);
	if (game.moves?.length! < 5) return "Not done yet";

	//Glavna dijagonala
	if (
		matrix[0][0] !== "" &&
		matrix[0][0] === matrix[1][1] &&
		matrix[1][1] === matrix[2][2]
	)
		return matrix[0][0];

	//Sporedna dijagonala
	if (
		matrix[0][2] !== "" &&
		matrix[0][2] === matrix[1][1] &&
		matrix[1][1] === matrix[2][0]
	)
		return matrix[0][2];

	//Vodoravne varijante pobjednika
	for (let i = 0; i < 3; i++) {
		if (
			matrix[0][i] !== "" &&
			matrix[0][i] === matrix[1][i] &&
			matrix[1][i] === matrix[2][i]
		)
			return matrix[0][i];
	}

	//Uspravne varijante pobjednika
	for (let i = 0; i < 3; i++) {
		if (
			matrix[i][0] !== "" &&
			matrix[i][0] === matrix[i][1] &&
			matrix[i][1] === matrix[i][2]
		)
			return matrix[i][0];
	}

	//Ako jos nema pobjednika
	return "N";
}

function fillMatrix(game: Game) {
	const matrix = [
		["", "", ""],
		["", "", ""],
		["", "", ""],
	];
	game.moves?.forEach((move: Move) => {
		matrix[move.xCoord][move.yCoord] =
			move.playerId === game.creatorId ? "X" : "O";
	});
	return matrix;
}

async function createOneGameHistory(game: IFullGame): Promise<HistoryItemDTO> {
	const winner = game.winnerId!;
	const player1 = new UserDTO(
		game.creatorId,
		(await UserModel.findById(game.creatorId))?.nickname ?? ""
	);
	const player2 = new UserDTO("", "");
	if (game.opponentId === "PC") {
		player2.id = "PC";
		player2.nickname = "PC";
	} else {
		player2.id = game.opponentId!;
		player2.nickname =
			(await UserModel.findById(game.opponentId))?.nickname ?? "";
	}
	return new HistoryItemDTO(game._id, player1, player2, winner, game.moves!);
}

export { pcMove, checkForWinner, calculateOutcome, createOneGameHistory };
