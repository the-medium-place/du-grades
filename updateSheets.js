require('dotenv').config()
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
    projectId: process.env.PROJECT_ID,
    keyFilename: process.env.SERVICE_KEY_FILE_PATH,
});

/**
   * Get public URL of a file. The file must have public access
   * @param {string} bucketName
   * @param {string} fileName
   * @return {string}
   */
const getPublicUrl = (bucketName, fileName) => `https://storage.googleapis.com/${bucketName}/${fileName}`;

/**
 * Copy file from local to a GCS bucket.
 * Uploaded file will be made publicly accessible.
 *
 * @param {string} localFilePath
 * @param {string} bucketName
 * @param {Object} [options]
 * @return {Promise}The public URL of the uploaded file.
 */
const copyFileToGCS = (localFilePath, bucketName, options = {}) => {

    const bucket = storage.bucket(bucketName);
    // const fileName = path.basename(localFilePath)÷\;
    const fileName = localFilePath.substr(2)
    const file = bucket.file(fileName);

    return bucket.upload(localFilePath, options)
        .then(() => file.makePublic())
};

module.exports = { copyFileToGCS, getPublicUrl }