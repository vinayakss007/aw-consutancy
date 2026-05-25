# Google Forms Automation Guide

## Method 1: Using Google Sheets to Create Forms (Easiest)

1. **Create a Google Sheet with your form questions** using the format below:

```
Question                    | Type          | Required | Options (if applicable)
---------------------------|---------------|----------|------------------------
Business Name              | Short answer  | Yes      |
Industry                   | Multiple choice | Yes     | Technology, Healthcare, Finance, Retail, Manufacturing, Professional Services, Education, Other
Years in Operation         | Multiple choice | Yes     | Less than 1 year, 1-3 years, 4-7 years, 8-15 years, Over 15 years
Company Size               | Multiple choice | Yes     | Solo entrepreneur, 2-10 employees, 11-50 employees, 51-200 employees, 201-500 employees, Over 500 employees
Primary Business Goals     | Paragraph     | Yes      |
Biggest Business Challenge | Paragraph     | Yes      |
```

2. **Using Google Apps Script to create a form from this sheet**:
   - Open your Google Sheet
   - Go to Extensions > Apps Script
   - Replace the default code with this:

```javascript
function createFormFromSheet() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  // Create a new form
  var form = FormApp.create('Business Assessment Form');
  
  // Iterate through the sheet data (skip header row)
  for (var i = 1; i < data.length; i++) {
    var question = data[i][0];
    var type = data[i][1];
    var required = data[i][2] === 'Yes';
    var options = data[i][3];

    if (type === 'Short answer') {
      var item = form.addTextItem();
    } else if (type === 'Paragraph') {
      var item = form.addParagraphTextItem();
    } else if (type === 'Multiple choice') {
      var item = form.addMultipleChoiceItem();
      if (options) {
        var optionList = options.split(',');
        var choices = [];
        for (var j = 0; j < optionList.length; j++) {
          choices.push(item.createChoice(optionList[j].trim()));
        }
        item.setChoices(choices);
      }
    } else if (type === 'Checkboxes') {
      var item = form.addCheckboxItem();
      if (options) {
        var optionList = options.split(',');
        var choices = [];
        for (var j = 0; j < optionList.length; j++) {
          choices.push(item.createChoice(optionList[j].trim()));
        }
        item.setChoices(choices);
      }
    } else {
      var item = form.addTextItem(); // Default to short answer
    }
    
    item.setTitle(question);
    item.setRequired(required);
  }
  
  Logger.log('Form URL: ' + form.getPublishedUrl());
}
```

3. **Run the script** to automatically generate your Google Form based on the spreadsheet data.

## Method 2: Copy-Paste Template Method

I'll create the exact formatted text you can copy into Google Forms:

### Initial Business Contact Form

**Form Title:** Business Information & Needs Assessment

**Description:** We're excited to learn more about your business and how we can help you achieve your growth goals. This brief form will help us understand your needs and customize our approach to best serve you.

**Questions:**

1. **Business Name**
   - Type: Short answer
   - Required: Yes

2. **Primary Contact Name**
   - Type: Short answer
   - Required: Yes

3. **Job Title**
   - Type: Short answer
   - Required: Yes

4. **Business Email**
   - Type: Short answer
   - Required: Yes
   - Validation: Email address

5. **Business Phone**
   - Type: Short answer
   - Required: Yes

6. **Industry**
   - Type: Multiple choice
   - Required: Yes
   - Options: Technology, Healthcare, Finance, Retail/E-commerce, Manufacturing, Professional Services, Education, Other

7. **Business Location (City, State)**
   - Type: Short answer
   - Required: Yes

8. **Years in Operation**
   - Type: Multiple choice
   - Required: Yes
   - Options: Less than 1 year, 1-3 years, 4-7 years, 8-15 years, Over 15 years

9. **Company Size**
   - Type: Multiple choice
   - Required: Yes
   - Options: Solo entrepreneur, 2-10 employees, 11-50 employees, 51-200 employees, 201-500 employees, Over 500 employees

10. **What are your primary business goals for the next 12 months?**
    - Type: Paragraph
    - Required: Yes

11. **What is the biggest challenge your business is currently facing?**
    - Type: Paragraph
    - Required: Yes

12. **How did you hear about our consulting services?**
    - Type: Multiple choice
    - Required: No
    - Options: Referral, Search engine, Social media, Industry event, Other

13. **Best time to contact you**
    - Type: Multiple choice
    - Required: No
    - Options: Morning (8am-12pm), Afternoon (12pm-5pm), Evening (5pm-8pm), No preference

14. **How soon would you like to start working with a consultant?**
    - Type: Multiple choice
    - Required: No
    - Options: Immediately, Within 1 month, Within 3 months, Sometime next quarter, Just researching options

## Steps to Create the Form:
1. Go to [forms.google.com](https://forms.google.com)
2. Click the "+" button to create a new form
3. Enter the title and description
4. One by one, copy the questions from the list above
5. For each question:
   - Paste the question text in the title field
   - Select the correct question type
   - Mark as required if specified
   - Add options (for multiple choice) if provided
   - Set validation if specified (like email format)

This method is much faster than creating questions from scratch and ensures you don't miss important data points.