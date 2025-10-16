Step 1:
Create empty uploads folder
Create IAM User for Textract
In your AWS Console, search for IAM in the top search bar
Click Users in the left sidebar
Click Create user button
Enter username: textract-user
Click Next
Select Attach policies directly
In the search box, type: textract
Check the box for: AmazonTextractFullAccess
Click Next, then Create user

Step 2: Generate Access Keys
Click on the user you just created (textract-user)
Go to Security credentials tab
Scroll down to Access keys section
Click Create access key
Select Application running outside AWS
Click Next, then Create access key
IMPORTANT: Copy both:
Access Key ID (starts with AKIA...)
Secret Access Key (click "Show" to see it)
Save these somewhere safe - you won't see the secret again!

(Key pdf in current folder)
curl -X POST -F "file=@./aadhar.pdf" http://localhost:3000/extract
