import axios from "axios";
import inquirer from "inquirer";
import ora from "ora";
import chalk from "chalk";
import { io } from "socket.io-client";

const API_URL = "http://localhost:3000";
const socket = io(API_URL);

async function main() {
  const { username } = await inquirer.prompt([
    { type: "input", name: "username", message: "enter your username" },
  ]);

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "create or join a room",
      choices: ["create", "join"],
    },
  ]);

  let roomId: number;

  if (action === "create") {
    const { data: room } = await axios.post(`${API_URL}/room`);
    roomId = room.id;
    console.log(chalk.green(`created room with ID: ${roomId}`));
  } else {
    const { data: rooms } = await axios.get(`${API_URL}/rooms`);
    if (rooms.length === 0) {
      console.log(chalk.red("no rooms"));
      return;
    }

    const { chosenRoomId } = await inquirer.prompt([
      {
        type: "list",
        name: "chosenRoomId",
        message: "select a room to join",
        choices: rooms.map((r: any) => ({
          name: `room ${r.id} (${r.status})`,
          value: r.id,
        })),
      },
    ]);
    roomId = chosenRoomId;
  }

  await axios.post(`${API_URL}/room/join`, { roomId, username });
  console.log(chalk.blue(`joined room ${roomId}. waiting to start ...`));

  socket.emit("joinRoom", roomId);

  if (action === "create") {
    const { startNow } = await inquirer.prompt([
      { type: "confirm", name: "startNow", message: "Start the race now?" },
    ]);
    if (startNow) {
      socket.emit("startRace", roomId);
    }
  }

  await new Promise<void>((resolve) => {
    socket.on("raceStarted", () => {
      console.log(chalk.green("\nrace started"));
      resolve();
    });
  });

  const { data: room } = await axios.get(`${API_URL}/room/${roomId}`);
  const { text } = room;

  console.log(chalk.yellow("\ntype the following text:"));
  console.log(chalk.cyan(text.content));
  const start = Date.now();

  const { userInput } = await inquirer.prompt([
    { type: "input", name: "userInput", message: "your input:" },
  ]);
  const timeTaken = (Date.now() - start) / 1000;

  const resultRes = await axios.post(`${API_URL}/room/finish`, {
    username,
    roomId,
    userInput,
    timeTaken,
  });

  const result = resultRes.data;
  console.log(
    chalk.green(
      `\nyour WPM: ${result.wpm.toFixed(2)}, Accuracy: ${(
        result.accuracy * 100
      ).toFixed(2)}%`
    )
  );

  socket.on("raceFinished", (results) => {
    console.log(chalk.green("\nAll players have finished!"));
    results.forEach((entry: any, i: number) => {
      console.log(
        `${i + 1}. ${entry.username} - WPM: ${entry.wpm.toFixed(
          2
        )}, Accuracy: ${(entry.accuracy * 100).toFixed(2)}%`
      );
    });
  });

  const { data: updatedRoom } = await axios.get(`${API_URL}/room/${roomId}`);
  if (updatedRoom.results) {
    console.log(chalk.magenta("\nRoom Results:"));
    updatedRoom.results.forEach((entry: any, i: number) => {
      console.log(
        `${i + 1}. ${entry.username} - WPM: ${entry.wpm.toFixed(
          2
        )}, Accuracy: ${(entry.accuracy * 100).toFixed(2)}%`
      );
    });
  }
  // version before from single player type thing
  //   const spinner = ora("fetching text...").start();
  //   const { data: text } = await axios.get("http://localhost:3000/text");
  //   spinner.succeed("text loaded");

  //   console.log(chalk.yellow("\nType the following text:"));
  //   console.log(chalk.cyan(text.content));
  //   const start = Date.now();

  //   const { userInput } = await inquirer.prompt([
  //     { type: "input", name: "userInput", message: "Your input:" },
  //   ]);
  //   const timeTaken = (Date.now() - start) / 1000;

  //   const resultRes = await axios.post("http://localhost:3000/finish", {
  //     username,
  //     textId: text.id,
  //     timeTaken,
  //     userInput,
  //   });

  //   const result = resultRes.data;
  //   console.log(
  //     chalk.green(
  //       `\nYour WPM: ${result.wpm.toFixed(2)}, Accuracy: ${(
  //         result.accuracy * 100
  //       ).toFixed(2)}%`
  //     )
  //   );

  //   const { seeLeaderboard } = await inquirer.prompt([
  //     { type: "confirm", name: "seeLeaderboard", message: "See leaderboard?" },
  //   ]);
  //   if (seeLeaderboard) {
  //     const { data: leaderboard } = await axios.get(
  //       "http://localhost:3000/leaderboard"
  //     );
  //     console.log(chalk.magenta("\nLeaderboard:"));
  //     leaderboard.forEach((entry: any, i: number) => {
  //       console.log(
  //         `${i + 1}. ${entry.username} - WPM: ${entry.wpm.toFixed(
  //           2
  //         )}, Accuracy: ${(entry.accuracy * 100).toFixed(2)}%`
  //       );
  //     });
  //   }
}

main().catch((err) => {
  console.error("error occured : ", err);
});
