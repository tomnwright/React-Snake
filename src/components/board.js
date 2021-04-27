import { useState, useEffect, useRef } from "react";
import { useInterval } from "../tools";

const GRID_SIZE = 9;
const UPDATE_INTERVAL = 250;
const RESTART_WAIT = 1000;

function randomInt(min, max) {
	// generate random integer between min and max incl.
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const randomCell = (not = []) => {
	let seed;
	do {
		seed = randomInt(0, GRID_SIZE * GRID_SIZE - 1);
	} while (not.includes(seed));

	return seed;
};

const DIRECTIONS = {
	up: 0,
	right: 1,
	down: 2,
	left: 3,
};

const DIRECTION_VECTORS = {
	0: { dRow: -1, dCol: 0 },
	1: { dRow: 0, dCol: 1 },
	2: { dRow: 1, dCol: 0 },
	3: { dRow: 0, dCol: -1 },
};

const OPPOSITE_DIRECTIONS = {
	0: DIRECTIONS.down,
	1: DIRECTIONS.left,
	2: DIRECTIONS.up,
	3: DIRECTIONS.right,
};

const DIRECTION_ROTATIONS = {
	0: 0,
	1: 90,
	2: 180,
	3: -90,
};

const Board = () => {
	const [board] = useState(
		new Array(GRID_SIZE).fill(0).map((row) => new Array(GRID_SIZE).fill(0))
	);
	const [snake, setSnake] = useState([randomCell()]);
	const [food, setFood] = useState(randomCell(snake));
	const [score, setScore] = useState(0);

	const [dead, setDead] = useState(false);

	const allowInput = useRef(true);
	const direction = useRef(randomInt(0,3));
	const queueDirection = useRef(NaN);

	// update if still alive
	useInterval(
		() => {
			moveSnake();
		},
		dead ? null : UPDATE_INTERVAL
	);
	useEffect(() => {
		window.addEventListener("keydown", (e) => {
			handleKeydown(e);
		});
	}, []);

	const moveSnake = () => {
		console.log("Moving Snake");

		allowInput.current = true;

		// calculate next head position
		let head = snake[0];
		let nextHead = nextHeadIndex(head, direction.current);

		if (isNaN(nextHead)) {
			// out of bounds
			return die();
		}

		// add next position
		let newSnake = [nextHead, ...snake];

		if (nextHead === food) {
			// landing on food
			console.log("EAT!");
			setFood(randomCell(newSnake));
		} else {
			// no food: remove final element
			newSnake.pop();
		}

		// if on self
		if (snake.includes(nextHead)) {
			return die();
		}

		// update snake

		setSnake(newSnake);

		// update score
		setScore((newSnake.length - 1) * 10);

		handleDirQueue();
	};

	const handleKeydown = (e) => {
		let inputDirection;

		switch (e.key) {
			case "ArrowRight":
			case "d":
				inputDirection = DIRECTIONS.right;
				break;
			case "ArrowLeft":
			case "a":
				inputDirection = DIRECTIONS.left;
				break;
			case "ArrowUp":
			case "w":
				inputDirection = DIRECTIONS.up;
				break;
			case "ArrowDown":
			case "s":
				inputDirection = DIRECTIONS.down;
				break;
			default:
				return;
		}

		if (!allowInput.current) {
			queueDirection.current = inputDirection;
			return;
		}

		handleDirInput(inputDirection);
	};

	const handleDirInput = (inputDirection) => {
		let opposite = OPPOSITE_DIRECTIONS[direction.current];
		if (
			direction.current === inputDirection ||
			opposite === inputDirection
		) {
			return;
		}

		direction.current = inputDirection;
		allowInput.current = false;
	};
	const handleDirQueue = () => {
		if (isNaN(queueDirection.current)) {
			return;
		}

		handleDirInput(queueDirection.current);
		queueDirection.current = NaN;
	};

	const die = () => {
		setDead(true);
		setTimeout(restart, RESTART_WAIT);
        queueDirection.current = NaN;
	};
	const restart = () => {
		let newSnake = [randomCell()];
		setSnake(newSnake);
		setFood(randomCell(newSnake));

		setScore(0);
		direction.current = randomInt(0,3);

		setDead(false);
	};

	const nextHeadIndex = (headIndex, moveDirection) => {
		let row = Math.floor(headIndex / GRID_SIZE);
		let col = headIndex % GRID_SIZE;

		const { dRow, dCol } = DIRECTION_VECTORS[moveDirection];

		row += dRow;
		col += dCol;

		if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
			return NaN;
		}

		return row * GRID_SIZE + col;
	};

	const computeCellClass = (row, col) => {
		let index = row * GRID_SIZE + col;

		return food === index
			? "food" // food
			: !snake.includes(index)
			? "" // not snake (or food)
			: index !== snake[0]
			? "snake-body" // not head
			: dead
			? "snake-dead" // dead head
			: "snake-head"; // normal head
	};

	const computeCellStyle = (row, col) => {
		let index = row * GRID_SIZE + col;

		if (index !== snake[0]) {
			// not head
			return {};
		}

		return {
			transform: `rotate(${DIRECTION_ROTATIONS[direction.current]}deg)`,
		};
	};

	return (
		<div className="board" onClick={moveSnake}>
			<h1>Score: {score}</h1>
			{board.map((row, rowIndex) => (
				<div key={rowIndex} className="row">
					{row.map((cell, colIndex) => (
						<div
							key={colIndex}
							className={`cell ${computeCellClass(
								rowIndex,
								colIndex
							)}`}
							style={computeCellStyle(rowIndex, colIndex)}
						></div>
					))}
				</div>
			))}
		</div>
	);
};

export default Board;
