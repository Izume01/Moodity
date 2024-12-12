import figlet from "figlet";
import chalk from "chalk";
import inquirer from "inquirer";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const adapter = new JSONFile("db.json");
const db = new Low(adapter, { log: {} });

async function loggingDb(date, logs) {
  await db.read();

  if (!db.data.log[date]) {
    db.data.log[date] = [];
  }

  db.data.log[date].push(logs);

  await db.write();
}

function loggingData() {
  const questions = [
    {
      type: "list",
      name: "mood",
      message: "How are you feeling today?",
      choices: ["Happy", "Sad", "Neutral", "Angry", "Excited", "Stressed"],
    },
    {
      type: "number",
      name: "activity",
      message: "Rate your day? (1-10)",
      validate: function (value) {
        if (value > 10 || value < 1) {
          return "Please enter a number between 1 and 10";
        }
        if (isNaN(value)) {
          return "Please enter a number";
        }
        return true;
      }
    },
    {
      type: "input",
      name: "notes",
      message: "Any notes?",
    },
  ];

  inquirer.prompt(questions).then((answer) => {
    console.log("Logging your data...");
    const today = new Date().toISOString().split("T")[0]; // e.g., '2024-12-11'
    console.log(today);

    loggingDb(today, answer);
  });
}

async function analyzeData() {
  console.log("Analyzing...");
  await db.read();

  if (!db.data.log) {
    console.log("No data to analyze.");
    return;
  }

  const logs = db.data.log;
  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();
  const currentYearIndex = currentDate.getFullYear();

  let mood = {
    happy: 0,
    sad: 0,
    neutral: 0,
    angry: 0,
    excited: 0,
    stressed: 0,
  }
  let total_activity = 0;
  let total_logs = 0 

  for (const date in logs) {
    const logDate = new Date(date);
    const MonthIndex = logDate.getMonth();
    const YearIndex = logDate.getFullYear();

    
    if(MonthIndex === currentMonthIndex && YearIndex === currentYearIndex) {
      logs[date].forEach((log) => {
        switch (log.mood) {
          case "Happy":
            mood.happy++;
            break;
          case "Sad":
            mood.sad++;
            break;
          case "Neutral":
            mood.neutral++;
            break;
          case "Angry":
            mood.angry++;
            break;
          case "Excited":
            mood.excited++;
            break;
          case "Stressed":
            mood.stressed++;
            break;
        }

        
      });
      logs[date].forEach((log) => {
        total_activity += log.activity;
        total_logs++;
      })
      
    }
  }
  console.log(chalk.redBright("Mood Analysis for this month:"));
  console.log(chalk.yellow("Happy: ", mood.happy));
  console.log(chalk.yellow("Sad: ", mood.sad));
  console.log(chalk.yellow("Neutral: ", mood.neutral));
  console.log(chalk.yellow("Angry: ", mood.angry));
  console.log(chalk.yellow("Excited: ", mood.excited));
  console.log(chalk.yellow("Stressed: ", mood.stressed));

  console.log('\n')

  console.log(chalk.redBright("Activity Analysis for this month:"));
  console.log(chalk.yellow("Total Activity: ", total_activity));
  console.log(chalk.yellow("Total Logs: ", total_logs));
  console.log(chalk.yellow("Average Activity: ", total_activity/total_logs));
  console.log('\n')
}

figlet("Tracking App", function (err, data) {
  if (err) {
    console.log(chalk.red("Something went wrong..."));
    console.dir(err);
    return;
  }
  console.log(chalk.blue(data));
  console.log(chalk.green("Welcome to the Tracking App!"));

  const options = [
    {
      type: "list",
      name: "choice",
      message: "What would you like to do?",
      choices: [
        "Log your Mood",
        "Analyze (This Month)",
        "Trends (Weekly)",
        "Exit",
      ],
    },
  ];

  inquirer
    .prompt(options)
    .then((option) => {
      if (option.choice === "Log your Mood") {
        loggingData();
      } else if (option.choice === "Analyze (This Month)") {
        analyzeData();
      } else if (option.choice === "Trends (Weekly)") {
        console.log("Trending...");
        console.log("This feature is not available yet.");

      } else if (option.choice === "Exit") {
        console.log("Goodbye!");
        process.exit(0);
      }
    })
    .catch((err) => {
      console.log(chalk.red("Something went wrong..."));
      console.dir(err);
    });
});