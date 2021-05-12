const fs = require('fs');
const axios = require('axios').default;
const inquirer = require('inquirer');
require('dotenv').config()
const getAuthToken = require('./getAuthToken')
const { copyFileToGCS, getPublicUrl } = require('./updateSheets')

getGradeData();
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
            uploadPrompt(fileName);
        }, 1500);
    }).catch(err => console.log(err))
}

/**
   * Prompt user to upload, then upload to Google Sheets
   * @param {string} fileName - name of file to be uploaded to GSC
   */
function uploadPrompt(fileName) {
    console.log("\n\n===================================\n\n")
    if (fs.existsSync('./' + fileName)) {
        inquirer.prompt([
            {
                type: 'confirm',
                message: `Upload "${fileName}" to storage bucket "${process.env.GOOGLE_BUCKET_NAME}"?`,
                name: "isUpload"
            }
        ]).then(resp => {
            if (resp.isUpload) {
                copyFileToGCS(`./${fileName}`, process.env.GOOGLE_BUCKET_NAME, {})
                    .then(console.log(`File Upload SUCCESS!`))
                    .then(()=>deletePrompt(fileName))
            } else {
                deletePrompt(fileName)
                return;
            }
        })
    } else {
        console.log(fileName + ' does not exist yet!')
    }
}

/**
   * Prompt user to delete, then delete generated .csv file
   * @param {string} fileName - name of file to be deleted
   */
function deletePrompt(fileName) {
    if (fs.existsSync('./' + fileName)) {
        inquirer.prompt([
            {
                type: 'confirm',
                message: `Delete file "${fileName}" from local file system?`,
                name: "isDelete"
            }
        ]).then(resp => {
            if (resp.isDelete) {
                fs.unlink(`./${fileName}`, err => {
                   if (err) console.log(err)
                   console.log("File Deleted!\n====================\nBye!")
                })
            } else {
                console.log('Bye!')
                return;
            }
        })
    } else {
        console.log(fileName + ' does not exist yet!')
    }
}

/**
   * Organize student info in to usable object of students with all assignment info
   * @param {Object} gradesArr - array of objects where each object is a specific student's grade for a specific assignment
   * @returns {Object} { studentObj, assignmentArr } object of student info and array of all assignment names
   */
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
