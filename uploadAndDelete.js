const fs = require('fs');
const inquirer = require('inquirer');
const { copyFileToGCS } = require('./updateSheets')

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
                    .then(console.log(`File Upload SUCCESS!\n============================`))
                    .then(() => deletePrompt(fileName))
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

module.exports = { uploadPrompt, deletePrompt }