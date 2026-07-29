The current logic is already correct. There is just another flow we will modify to solidify the website.

It will have 2 screens; the user side and admin side. Below is the user flow each:

##Participant or User screen

1. Search Participant
Display a search field with the placeholder:
“Type your name…”
Implement autocomplete/search-as-you-type functionality.
Participants should be able to search using:
First Name
Last Name
Partial Name
Matching registered participants should appear in a dropdown list.
2. Display Registration Details
Once a participant selects their name, their information must be displayed: 
3. Confirm Registration
Include a prominent button:
Confirm Registration
Upon clicking, display a confirmation page/form.
4. Digital Signature
Require the participant to provide a digital signature before submission.
Fields:
Signature Pad
Date (auto-generated)
5. Kit Acknowledgement
Before submission, display the following acknowledgement statement:
I acknowledge that I have received my official conference kit and that the information reflected in my registration is accurate.
Include a checkbox:
☐ I have received my conference kit.
The participant should not be able to submit unless the checkbox is ticked.
6. Submission
After successful submission:
Lock the record to prevent duplicate confirmations.
Display a success message:
Thank you! Your registration has been successfully confirmed. Your conference kit receipt has also been recorded. Enjoy the 46th JCI Visayas Area Conference!
Copy:

Start:
Welcome to the 46th JCI Visayas Area Conference Registration Confirmation Portal.
To verify your registration, simply type your name in the search bar below. Once your details appear, review your information and complete your registration confirmation.
___
Registration Details
Please review the information below. If you notice any discrepancies, kindly proceed to the Secretariat before confirming your registration.
___
Conference Kit Confirmation
By confirming below, I acknowledge that I have received my official conference kit and that the registration information displayed is accurate.
☐ I have received my official conference kit.
___

Participant Signature
Please sign below to confirm your registration and acknowledge receipt of your conference kit.
___

✅ Registration Confirmed!
Thank you for confirming your registration. Your attendance and conference kit receipt have been successfully recorded.
We wish you a meaningful and enjoyable experience at the 46th JCI Visayas Area Conference – HALA BIRA: Rhythm of Change.

##ADMIN side screen:
As Admin 
The admin panel should allow the Secretariat to:
View all participants
Search participants
See confirmation status
See kit receipt status
View timestamp of confirmation
View digital signature
Export confirmations to Excel/CSV




## NEW FEATURE

- Information shown on ID are as listed:
 - Firstname + Lastname
 - PreferredName
 - Chapter
 - Tshirt Size

- On admin side:
 - add new tab for Payment Status if (paid or unpaid) from the "Form Responses 1' page on sheets (new code should check if the users local chapter has alreayd paid or not )
 - add new tab for reciept number for the moment(to do later for its backend which page or column to fetch)
 

 