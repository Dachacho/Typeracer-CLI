import axios from "axios";
import inquirer from "inquirer";
import ora from "ora";
import chalk from "chalk";

async function main() {
  const { username } = await inquirer.prompt([
    { type: "input", name: "username", message: "enter your username" },
  ]);

  const spinner = ora("fetching text...").start();
  const { data: text } = await axios.get("http://localhost:3000/text");
  spinner.succeed("text loaded");

  console.log(chalk.yellow("\nType the following text:"));
  console.log(chalk.cyan(text.content));
  const start = Date.now();

  const { userInput } = await inquirer.prompt([
    { type: "input", name: "userInput", message: "Your input:" },
  ]);
  const timeTaken = (Date.now() - start) / 1000;

  const resultRes = await axios.post("http://localhost:3000/finish", {
    username,
    textId: text.id,
    timeTaken,
    userInput,
  });

  const result = resultRes.data;
  console.log(
    chalk.green(
      `\nYour WPM: ${result.wpm.toFixed(2)}, Accuracy: ${(
        result.accuracy * 100
      ).toFixed(2)}%`
    )
  );

  const { seeLeaderboard } = await inquirer.prompt([
    { type: "confirm", name: "seeLeaderboard", message: "See leaderboard?" },
  ]);
  if (seeLeaderboard) {
    const { data: leaderboard } = await axios.get(
      "http://localhost:3000/leaderboard"
    );
    console.log(chalk.magenta("\nLeaderboard:"));
    leaderboard.forEach((entry: any, i: number) => {
      console.log(
        `${i + 1}. ${entry.username} - WPM: ${entry.wpm.toFixed(
          2
        )}, Accuracy: ${(entry.accuracy * 100).toFixed(2)}%`
      );
    });
  }
}

main().catch((err) => {
  console.error("error occured : ", err);
});
