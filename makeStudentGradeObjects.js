
/**
   * Organize student info in to usable object of students with all assignment info
   * @param {Object}gradesArr array of objects where each object is a specific student's grade for a specific assignment
   * @returns {Object}{ studentObj, assignmentArr } object of student info and array of all assignment names
   */
 module.exports = function makeStudentGradeObjects(gradesArr) {

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