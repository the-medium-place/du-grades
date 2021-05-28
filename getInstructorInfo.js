const axios = require("axios");
const getAuthToken = require('./getAuthToken')


getInstructorInfo();
/**
   * Retrieves info for BootcampSpot instructor - including all related cohorts
   * Logs all retrieved info to console
   */
async function getInstructorInfo() {

    // GET AUTHORIZATION TOKEN FOR ALL DATA RETRIEVAL
    // ****SET BCS USER EMAIL AND PASSWORD IN getAuthToken.js****
    // console.log("Getting Auth Token...");
    const authToken = await getAuthToken()
    // console.log("AUTH SUCCESS! Accessing BCS API now...")

    const apiUrl = "https://bootcampspot.com/api/instructor/v1/me";
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'authToken': authToken
        }
    }
    axios.get(apiUrl, config)
        .then(res => {
            const resArr = [];
            // COURSE ID'S CAN BE FOUND IN THE 'Enrollments' ARRAY IN API RESPONSE
            // console.log(res.data.Enrollments[0])
            res.data.Enrollments.forEach(courseObj => {
                const infoObj = {}
                infoObj["Course Code"] = courseObj.course.code;
                infoObj["Course ID"] = courseObj.courseId;
                resArr.push(infoObj)
            })
            console.table(resArr);
            console.log("Update the COURSE_ID variable in .env to match the desired course ID above!\n\n")
        })
        .catch(err => console.log(err))
}