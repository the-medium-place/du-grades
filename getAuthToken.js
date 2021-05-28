const axios = require('axios')
require('dotenv').config()

/**
   * Retrieves login token -
   * Necessary for retrieval of data from BootcampSpot API
   * @return {string} token value string
   */
module.exports = async function getAuthToken() {
    console.log("Getting Auth Token...");

    // SET email AND password TO BCS LOGIN INFO
    // ========================================
    const loginBody = {
        "email": process.env.BCS_EMAIL,
        "password": process.env.BCS_PASSWORD
    }

    const config = {
        headers: {
            'Content-Type': 'application/json',
        }
    }

    try {
        const res = await axios.post("https://bootcampspot.com/api/instructor/v1/login", loginBody, config)
        console.log("AUTH SUCCESS! Accessing BCS API now...\n============================\n")
        const token = res.data.authenticationInfo.authToken
        return token;
    } catch (err) {
        console.log("AUTH FAILURE! \n===========================\n", err)
    }
}