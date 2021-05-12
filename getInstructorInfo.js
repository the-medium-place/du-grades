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
    console.log("Getting Auth Token...");
    const authToken = await getAuthToken()
    console.log("AUTH SUCCESS! Accessing BCS API now...")

    const apiUrl = "https://bootcampspot.com/api/instructor/v1/me";
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'authToken': authToken
        }
    }
    axios.get(apiUrl, config)
        .then(res => {
            // COURSE ID'S CAN BE FOUND IN THE 'Enrollments' ARRAY IN API RESPONSE
            console.log(res.data)
        })
        .catch(err => console.log(err))
}