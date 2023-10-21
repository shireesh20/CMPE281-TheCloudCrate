# CMPE281-TheCloudCrate

Introduction:<br>
  • The Cloud Crate, is a 3-tier highly scalable, highly available, fast, reliable, secure, and cost- effective file storage application according to the given problem statement.<br>
  • The application is hosted on AWS leveraging various services of AWS.<br>
  • The application offers various features like User Authentication, Role-based authentication, File Upload, File Download, File Update, and File Delete.<br>
  • The application provides seamless user experience with interactive user-friendly UI.<br><br>
  
Technologies Used:<br>
  • Frontend: ReactJS<br>
  • Backend: ExpressJS<br>
  • Cloud Provider: AWS<br><br>

Application URL: https://thecloudcrate.online<br><br>

AWS Services Used:<br>
  • EC2: 2 base EC2 Ubuntu instances are used. 1 for running frontend and another for running backend server. <br>
  • ELB: Load balancers are used to distribute the load coming on to the servers. It makes sure that the load is evenly distributed and thus the response is rendered as soon as possible. I have used 2 load balancers, 1 
    for frontend server and 1 for backend servers.<br>
  • Autoscaling Group: Auto-scaling groups are used to increase the number of ec2 instances whenever there is heavy load. Load balancers combined with auto-scaling groups provides a highly scalable and available solution. 
    I have used 2 auto-scaling groups: 1 for frontend servers and another for backend servers.<br>
  • Lambda: Lambda is a serverless computing platform. It can listen to events from AWS services and run code to perform desired action. I have used Lambda to delete an object from replication bucket whenever an object is 
    deleted from origin bucket.<br>
  • DynamoDB: It’s a NoSQL database provided by AWS. It persists data as key-value pairs and it’s multi-region architecture makes it highly available. I have used DynamoDB to store the metadata of the files.<br>
  • CloudFront: It is a CDN provided by AWS. Cached files are retrieved within no time from edge locations, thereby decreasing latency and load on origin.<br>
  • S3: S3 is a storage service offered by AWS. It stores data in the form of objects. It’s features like Auto-replication, lifecycle management are helpful to achieve Disaster Recovery and cost- effectiveness.<br>
  • S3 Transfer Acceleration: S3 Transfer Acceleration works like magic in the case of file uploads. It drastically reduces the file upload time leveraging global edge locations.<br>
  • R53: It is a service provided by AWS to route users to the internet facing applications. I have used R53 to route the traffic coming to my domain to the ELB of frontend servers.<br>
  • CloudWatch: Logging service provided by AWS. All autoscaling metrics, lambda metrics and logs will be stored in CloudWatch. If any issue arises, we can check the logs for more details.<br>
  • SNS: Used for rendering notifications. I have created SNS notifications for several topics. If a file is deleted from S3, it automatically sends an email to the root user. It also sends notifications whenever scaling 
    happens or termination of instances occurs. I am also monitoring the health of the servers and as soon as they are unhealthy, I will get a notification to my email.<br><br>

Steps to run the project locally<br>
  • Clone the repository<br>
  • Install NodeJS<br>
  • Install the required dependencies for frontend and backend using 'npm install' under both frontend and backend directories<br>
  • Create a .env file and provide the access keys of your AWS account<br>
  • For starting frontend server, run 'npm start' and for starting backend server go to the backend/node_server/src and run 'node app.js'<br>
  • Change the endPointUrl in the code to point to your localhost<br>
  • P.S: Note that correct setup of AWS Cloud services like S3, CloudFront, Dynamo DB would be requird to run it. Keep the setup ready and change the details of them in the code<br>

