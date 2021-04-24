const axios = require('axios')
require('dotenv').config()

// GET LOGIN AUTH TOKEN
module.exports = async function getAuthToken() {

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
    const token = await axios.post("https://bootcampspot.com/api/instructor/v1/login", loginBody, config)
        .then(res => {
            return res.data.authenticationInfo.authToken

        })
        .catch(err => console.log(err))
    // console.log('token: ',token);
    return token;
}