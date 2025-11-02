
import { GOOGLE_SCRIPT_URL } from '../constants';
import { LeaveRequest } from '../types';

/**
 * --- HOW TO STORE DATA IN GOOGLE SHEETS ---
 * 
 * To securely store leave request data in a Google Sheet from this client-side application,
 * you need to use Google Apps Script as a middle-man. This prevents exposing any API keys
 * or credentials in the browser.
 *
 * Follow these steps:
 *
 * 1. CREATE GOOGLE SHEET:
 *    - Go to sheets.google.com and create a new Sheet.
 *    - Add the following headers in the first row:
 *      `SubmissionDate`, `EmployeeName`, `EmployeeID`, `LeaveType`, `StartDate`, `EndDate`, `Reason`
 *    - Copy the Sheet ID from the URL. The URL looks like:
 *      `https://docs.google.com/spreadsheets/d/THIS_IS_THE_SHEET_ID/edit`
 *
 * 2. CREATE GOOGLE APPS SCRIPT:
 *    - Go to script.google.com and create a new project.
 *    - Give it a name like "Leave Request Handler".
 *    - Paste the following code into the `Code.gs` file:
 *
 *      ```javascript
 *      // Replace with your actual Google Sheet ID
 *      var SPREADSHEET_ID = "YOUR_GOOGLE_SHEET_ID";
 *      var SHEET_NAME = "Sheet1"; // Or whatever your sheet is named
 *
 *      function doPost(e) {
 *        try {
 *          var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
 *          var data = JSON.parse(e.postData.contents);
 *
 *          // The order here MUST match the order of your columns in the sheet
 *          var newRow = [
 *            new Date(data.submissionDate),
 *            data.employeeName,
 *            data.employeeId,
 *            data.leaveType,
 *            new Date(data.startDate),
 *            new Date(data.endDate),
 *            data.reason
 *          ];
 *
 *          sheet.appendRow(newRow);
 *
 *          return ContentService
 *            .createTextOutput(JSON.stringify({ "status": "success", "data": JSON.stringify(data) }))
 *            .setMimeType(ContentService.MimeType.JSON);
 *
 *        } catch(error) {
 *          return ContentService
 *            .createTextOutput(JSON.stringify({ "status": "error", "message": error.message }))
 *            .setMimeType(ContentService.MimeType.JSON);
 *        }
 *      }
 *      ```
 *
 * 3. DEPLOY AS WEB APP:
 *    - In the Apps Script editor, click "Deploy" > "New deployment".
 *    - For "Select type", choose "Web app".
 *    - In the configuration:
 *      - Description: "Handles leave requests"
 *      - Execute as: "Me"
 *      - Who has access: "Anyone" (This makes it a public endpoint. For production, you might restrict this).
 *    - Click "Deploy".
 *    - AUTHORIZE the script to access your Google Sheets.
 *    - Copy the "Web app URL" provided.
 *
 * 4. UPDATE CONSTANT:
 *    - Paste the copied Web app URL into `constants.ts` to replace the placeholder `GOOGLE_SCRIPT_URL`.
 */

export const submitLeaveRequest = async (data: LeaveRequest): Promise<boolean> => {
  if (GOOGLE_SCRIPT_URL.includes('YOUR_DEPLOYMENT_ID')) {
    console.error('Please update the GOOGLE_SCRIPT_URL in constants.ts');
    // Simulate a successful submission for demonstration purposes if URL is not set
    console.log('Simulating successful submission:', data);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    return true;
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      redirect: 'follow',
    });

    const result = await response.json();
    
    if (result.status === 'success') {
      return true;
    } else {
      console.error('Error from Google Apps Script:', result.message);
      throw new Error(result.message || 'The submission failed.');
    }
  } catch (error) {
    console.error('Failed to submit leave request:', error);
    if (error instanceof TypeError) { // Often indicates a CORS issue
        throw new Error("Submission failed. This could be a CORS issue. Please ensure your Google Apps Script is deployed correctly for 'Anyone' access.");
    }
    throw error;
  }
};
