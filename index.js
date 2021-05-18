const getGradeData = require('./getGradeData');
const getWeeklyFeedback = require('./getWeeklyFeedback');

const inquirer = require("inquirer");
console.log("WELCOME TO THE BCS DATA RETRIEVAL SYSTEM...\n=================================")
inquirer.prompt([
    {
        type: 'list',
        message: 'What would you like to do?',
        name: "gradesOrFeedback",
        choices: ["Download Student Grade Data", "Download Student Feedback Data", "Quit"]
    }
]).then(res => {
    console.log(res)
    if (res.gradesOrFeedback === 'Download Student Grade Data') {getGradeData()}
    else if (res.gradesOrFeedback === "Download Student Feedback Data") {getWeeklyFeedback();}
    else if (res.gradesOrFeedback === 'Quit') {console.log("Bye!")}
})