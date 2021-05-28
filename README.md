# Grade Tracking

This application is used to access the [BootCampSpot](http://www.bootcampspot.com) instructor API and create a Google Sheets page of all students and associated grades for a BCS cohort. The application automatically retrieves the grades, writes them to a .csv file, and then uploads that file to a specified Google Cloud Storage Bucket, which has been configured to create a Google Sheets page upon upload. 

## Usage

### **Requirements:**
* BCS Instructor account (login Email and Password required to retrieve BCS API Auth Token)
* Google Sheets spreadsheet (and spreadsheet ID, which can be found in the URL of the sheet)
* Google App connected to above spreadsheet to automate import of .csv file from Google Storage Bucket to Sheets
    * [Quickstart Guide](https://codelabs.developers.google.com/codelabs/cloud-function2sheet#0) to create such an app
    * App must have enabled Google Sheets API and Google Cloud Storage JSON API
    * App must have associated Storage Bucket set to public access and 'fine-grained' access control
* Service Account Key for Google App to access App resources (storage bucket, etc)
    * Key and other authorization info should be saved in a root-level `.json` file, and will be auto-generated when you 'create credentials' for your service account on the Google Cloud Console
        * **NOTE:** this credentials file **must remain private**, make sure to add it to your `.gitignore` (the repo automatically ignores any file called `credentials.json`)

* Once the requirements are met clone this repo to your local machine
* Create a `.env` file with the following information:
```
BCS_EMAIL=<< YOUR BOOTCAMP SPOT LOGIN EMAIL >>
BCS_PASSWORD=<< YOUR BOOTCAMP SPOT SECRET PASSWORD >>
GOOGLE_BUCKET_NAME=<< NAME OF YOUR GOOGLE APP STORAGE BUCKET >>
PROJECT_ID=<< PROJECT ID OF GOOGLE APP >>
SERVICE_KEY_FILE_PATH=<< LOCAL FILEPATH TO SERVICE KEY .JSON FILE >>
COURSE_ID=<< COURSE ID CAN BE FOUND RUNNING npm run courses IN THE TERMINAL >>
```
**NOTE: To view the 'course ID' of all cohorts you are associated with, run `npm run courses` in the terminal. This wil ouput a table with course information needed to update `.env`**

* Once the above is complete, install all dependencies by running `npm install` in the terminal at the repo directory
* Run the program with `npm start`. You will be prompted to download either student *grade* information or *weekly feedback* information.
* The generated file will be named starting with the current date, followed by `-grades.csv` (ex: `Sat-Apr-24-2021-grades.csv`). 
* After the file is generated, you will be prompted to upload the file to the connected Google Storage Bucket

## Questions: 

* Email: <zgstowell@gmail.com>
 
* [GitHub Profile](https://github.com/the-medium-place)

![user image](https://avatars3.githubusercontent.com/u/58536071?v=4&s=40)