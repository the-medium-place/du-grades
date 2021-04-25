const axios = require("axios");
const getAuthToken = require('./getAuthToken')

// THIS FUNTION RETURNS INFO FOR USER (LOGIN INFO FROM ENV VARIABLES)
// COURSE ID'S CAN BE FOUND IN THE 'Enrollments' ARRAY
getInstructorInfo();

async function getInstructorInfo() {

    const authToken = await getAuthToken();

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