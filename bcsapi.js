const fs = require('fs');
const axios = require('axios').default;
const inquirer = require('inquirer');
require('dotenv').config()
const getAuthToken = require('./getAuthToken')
const { copyFileToGCS, getPublicUrl } = require('./updateSheets')



// FIXME: GET GRADE INFO
async function getGradeData() {
    // GET AUTHORIZATION TOKEN FOR ALL DATA RETRIEVAL
    // ****SET BCS USER EMAIL AND PASSWORD IN getAuthToken.js****
    console.log("Getting Auth Token...");
    const authToken = await getAuthToken()
    console.log("AUTH SUCCESS! Accessing BCS API now...")

    // API CALL SETUP
    const gradesURL = 'https://bootcampspot.com/api/instructor/v1/grades';
    const payload = {
        courseId: 3160 // COURSE ID CAN BE FOUND BY GETTING INFORMATION ('.../me' call) AND VIEWING ASSOCIATED COHORTS
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
        const newDate = new Date().toString().split(" ").join("-")

        const fileName = `${newDate}-grades.csv`

        fs.writeFile(fileName, 'NAME,AVERAGE,' + assignmentStr, function (err) {
            if (err) throw err;
            console.log(`New file "${fileName}" created!!`);
            console.log(`Line 1 written to "${fileName}"`)
        })
        // EACH SUBSEQUENT ROW SHOULD BE STUDENT NAME FOLLOWED BY GRADE VALUES
        // capture student name and grades
        const studentObj = makeStudentGradeObjects(res.data).studentObj
        const studentNames = Object.keys(studentObj)
        // console.log(studentNames)
        // loop through array of names
        studentNames.forEach((student, i) => {
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

            goAgain(fileName);

        }, 1500);

    }).catch(err => console.log(err))
}

function goAgain(fileName) {
    console.log("\n\n===================================\n\n")
    if (fs.existsSync('./' + fileName)) {
        inquirer.prompt([
            {
                type: 'confirm',
                message: `Upload ${fileName} to storage bucket "${process.env.GOOGLE_BUCKET_NAME}"?`,
                name: "isUpload"
            }
        ]).then(resp => {
            if (resp.isUpload) {
                copyFileToGCS(`./${fileName}`, process.env.GOOGLE_BUCKET_NAME, {})
                console.log('File Uploaded!')
            } else {
                console.log('Bye!')
                return;
            }
        })
    } else {
        console.log(fileName + ' does not exist yet!')
    }

}


function makeStudentGradeObjects(gradesArr) {

    const grades2nums = {
        'A+': 1,
        'A': 2,
        'A-': 3,
        'B+': 4,
        'B': 5,
        'B-': 6,
        'C+': 7,
        'C': 8,
        'C-': 9,
        'D+': 10,
        'D': 11,
        'D-': 12,
        'F': 13,
        'I': 14

    }

    const studentObj = {};
    const assignmentArr = [];
    gradesArr.forEach(gradeObj => {
        if (!studentObj[gradeObj.studentName]) {
            studentObj[gradeObj.studentName] = { assignments: [] };
        }
        if (!assignmentArr.includes(gradeObj.assignmentTitle)) {
            assignmentArr.push(gradeObj.assignmentTitle)
        }
        studentObj[gradeObj.studentName].assignments.push({
            name: gradeObj.assignmentTitle,
            submitted: gradeObj.submitted ? 'yes' : 'no',
            grade: grades2nums[gradeObj.grade] || '',
        })
    })
    // console.log(assignmentArr)
    return { studentObj, assignmentArr }
}


getGradeData();


// GET USER INFO ABOUT ME - ZAC - INCLUDING WHICH COURSES I'M 
// ASSOCIATED WITH

// fetch("https://bootcampspot.com/api/instructor/v1/me", {
//     method: 'GET',
//     headers: {
//         'Content-Type': 'application/json',
//         'authToken': authToken
//     },
// }).then(res => console.log(res.json()))