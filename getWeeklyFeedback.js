const axios = require("axios");
const getAuthToken = require('./getAuthToken')
const { uploadPrompt } = require('./uploadAndDelete')
const fs = require('fs')
require("dotenv").config()

async function getWeeklyFeedback() {
    const authToken = await getAuthToken()

    const apiUrl = "https://bootcampspot.com/api/instructor/v1/weeklyFeedback";
    const body = {
        "courseId": parseInt(process.env.COURSE_ID)
    }
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'authToken': authToken
        }
    }

    axios.post(apiUrl, body, config)
        .then(res => {
            makeFeedbackCSV(res.data)
        })
        .catch(err => console.log(err))
}

function makeFeedbackCSV(data) {
    console.log('the date: ', data.submissions[1].date)
    console.log('the converted date: ', new Date(data.submissions[1].date).toUTCString().substr(0, 16).replace(',', ''))
    let csvLine1 = ["NAME"];

    const newDate = new Date(data.submissions[1].date)
        .toUTCString()
        .substr(0, 16)
        .replace(',', '')
        .split(" ")
        .join("-")
    const fileName = `${newDate}-feedback.csv`

    data.surveyDefinition.steps.forEach(stepObj => {
        // FIRST LINE SHOULD BE 'NAME', FOLLOWED BY QUESTION TEXT
        csvLine1.push(`"${stepObj.text}"`)
    })
    // MAKE STRING FROM ARRAY OF QUESTIONS AND CREATE .csv FILE WITH INITIAL LINE
    fs.writeFile(fileName, csvLine1.join(","), (err) => {
        if (err) throw err;
        console.log(`Line 1 of ${fileName} written!!`)
    })

    // LOOP THROUGH SUBMISSIONS AND CREATE A NEW LINE FOR EACH STUDENT (EACH OBJECT IN RESPONSE ARRAY)
    data.submissions.forEach(submitObj => {
        let csvLine = [submitObj.username];
        submitObj.answers.forEach(answerObj => {
            const value = answerObj.answer ? `"${answerObj.answer.value}"` : ''
            csvLine.push(value)
        })
        // console.log("length of csvLine array: ", csvLine.length)
        // console.log("test the csvLine: ",csvLine)
        fs.appendFile(fileName, '\n' + csvLine.join(","), (err) => {
            if (err) throw err;
            console.log(`${csvLine[0]} responses written to ${fileName}`)
        })
    })
    setTimeout(() => {
        uploadPrompt(fileName);
    }, 1500);
}

module.exports = getWeeklyFeedback;