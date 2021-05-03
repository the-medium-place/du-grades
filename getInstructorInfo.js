const axios = require("axios");
const getAuthToken = require('./getAuthToken')

// THIS FUNTION RETURNS INFO FOR USER (LOGIN INFO FROM ENV VARIABLES)
// COURSE ID'S CAN BE FOUND IN THE 'Enrollments' ARRAY

getInstructorInfo();

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
            console.log(res.data)
        })
        .catch(err => console.log(err))
}