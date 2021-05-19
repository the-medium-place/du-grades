const fs = require('fs');
const axios = require('axios').default;
require('dotenv').config()
const getAuthToken = require('./getAuthToken')
const { uploadPrompt } = require('./uploadAndDelete')
const makeStudentGradeObjects = require("./makeStudentGradeObjects")

async function getGradeData() {
    // GET AUTHORIZATION TOKEN FOR ALL DATA RETRIEVAL
    // ****SET BCS USER EMAIL AND PASSWORD IN getAuthToken.js****
    console.log("Getting Auth Token...");
    const authToken = await getAuthToken()
    console.log("AUTH SUCCESS! Accessing BCS API now...")

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
            'authToken': authToken
        }
    }

    // API CALL FOR GRADES INFO
    // ========================
    axios.post(gradesURL, payload, config).then(res => {
        console.log("API request SUCCESS! Building .CSV now...\n================================================\n")
        // console.log(res.data) // ARRAY OF ASSIGNMENT OBJECTS
        // CREATE CSV OF GRADES
        // FIRST ROW SHOULD BE 'NAME', FOLLOWED BY ALL ASSIGNMENT NAMES
        const assignmentArr = makeStudentGradeObjects(res.data).assignmentArr;
        const assignmentStr = assignmentArr.join(',')
        const newDate = new Date().toDateString().split(" ").join("-")
        const fileName = `${newDate}-grades.csv`

        fs.writeFile(fileName, 'NAME,AVERAGE,' + assignmentStr, function (err) {
            if (err) throw err;
            console.log(`New file "${fileName}" created!!`);
            console.log(`Line 1 written to "${fileName}"`)
        })

        const droppedStudents = ['Daniel Allen', 'Bryan Martinez', 'christopher wilburn', 'Keon Min Park', 'Lu Liu', 'Moses Nsubuga', 'Nancy Quezada rodriguez', 'Pratham Kc', 'Ryan Dugan', 'Shanna Bernstein', 'Max Sandoval', 'Kevin Devlin']

        // EACH SUBSEQUENT ROW SHOULD BE STUDENT NAME FOLLOWED BY GRADE VALUES
        // capture student name and grades
        // FILTER OUT STUDENTS WHO HAVE DROPPED/TRANSFERRED (listed in droppedStudents array above)
        const studentObj = makeStudentGradeObjects(res.data).studentObj
        const studentNames = Object.keys(studentObj).filter(name => !droppedStudents.includes(name))

        // console.log(studentNames)
        // loop through array of names
        studentNames.forEach((student) => {
            let csvStr = '\n' + student + `,=ROUND(AVERAGE(INDIRECT("C" & Row()):INDIRECT("AE" & Row())))`;
            studentObj[student].assignments.forEach(assignment => {
                csvStr += (',' + assignment.grade)
            })
            fs.appendFile(fileName, csvStr, function (err) {
                if (err) throw err;
                console.log(`${student} grades written to file "${fileName}"`);
            })
        })
        setTimeout(() => {
            uploadPrompt(fileName);
        }, 1500);
    }).catch(err => console.log(err))
}
module.exports = getGradeData;