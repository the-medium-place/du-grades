const fs = require('fs');
const inquirer = require("inquirer")
const axios = require('axios').default;
require('dotenv').config()
const getAuthToken = require('./getAuthToken')
const uploadPrompt = require('./uploadAndDelete')
const makeStudentGradeObjects = require("./makeStudentGradeObjects")

async function getGradeData() {
    // GET AUTHORIZATION TOKEN FOR ALL DATA RETRIEVAL
    // ****SET BCS USER EMAIL AND PASSWORD IN getAuthToken.js****
    const authToken = await getAuthToken()

    // API CALL SETUP
    const gradesURL = 'https://bootcampspot.com/api/instructor/v1/grades';
    const payload = {
        // **COURSE ID CAN BE FOUND BY GETTING YOUR INSTRUCTOR INFO INFORMATION -**
        // **(SEE getInstructoInfo.js) AND VIEWING ASSOCIATED COHORTS**
        courseId: parseInt(process.env.COURSE_ID)
    }
    const config = {
        headers: {
            'Content-Type': 'application/json',
            authToken
        }
    }

    // API CALL FOR GRADES INFO
    // ========================
    try {
        const res = await axios.post(gradesURL, payload, config)
        // console.log(res.data)
        console.log("API request SUCCESS! Building .CSV now...\n================================================\n")

        makeGradeCSV(res)

    } catch (err) {

        console.log("API Request FAILURE: \n==========================\n", err)
    }

}

async function makeGradeCSV(res) {

    const studentGradeObjects = await makeStudentGradeObjects(res.data);
    const assignmentArr = studentGradeObjects.assignmentArr;
    const assignmentStr = assignmentArr.join(',')
    const newDate = new Date().toDateString().split(" ").join("-")
    const fileName = `${newDate}-grades.csv`

    fs.writeFile(fileName, 'NAME,AVERAGE,' + assignmentStr, function (err) {
        if (err) throw err;
        console.log(`New file "${fileName}" created!!`);
        console.log(`Line 1 written to "${fileName}"`)
    })

    const droppedStudents = JSON.parse(process.env.DROPPED_STUDENTS)

    // EACH SUBSEQUENT ROW SHOULD BE STUDENT NAME FOLLOWED BY GRADE VALUES
    // capture student name and grades
    // FILTER OUT STUDENTS WHO HAVE DROPPED/TRANSFERRED (listed in droppedStudents array above)
    const studentObj = studentGradeObjects.studentObj
    const studentNames = Object.keys(studentObj).filter(name => !droppedStudents.includes(name))

    // console.log(studentNames)
    // loop through array of names
    studentNames.forEach((student) => {
        let csvStr = '\n' + student + `,=ROUND(AVERAGE(INDIRECT("C" & Row()):INDIRECT("AE" & Row())))`;
        studentObj[student].assignments.forEach(assignment => {
            csvStr += ','
            csvStr += assignment.grade
        })
        fs.appendFile(fileName, csvStr, function (err) {
            if (err) throw err;
            console.log(`${student} grades written to file "${fileName}"`);
        })
    })


    setTimeout(() => {
        uploadPrompt(fileName);
    }, 1500);
}



module.exports = getGradeData;