const express = require('express');
const upload = require('express-Upload');
const app = express();
const cors = require('cors');
const port = 3001;
const fs = require('fs');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const envConfig = require('env').config();

if (envConfig.error) {
  throw envConfig.error;
}

console.log(envConfig.parsed);

app.use(upload({
  tempDir: 'tmp',
  useTempFiles: true
}));

const dynamoDB = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  region: "us-east-1",
  endpoint: "http://dynamodb.us-east-1.amazonaws.com",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

function deleteTempFile(path) {
  try {
    fs.unlinkSync(path);
  } catch (err) {
    console.error("Error in deleting temp file " + path, err);
  }
}

app.get('/', (req, res) => {
  res.status(200).send('OK');
});

app.post('/upload_file', function (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const uploadedFile = req.files.inputFile;

  if (uploadedFile.size > 10 * 1024 * 1024) {
    return res.status(400).send('File size should not exceed 10MB.');
  }

  console.log("tempPath:" + req.files.inputFile.tempPath);
  const fileStream = fs.createReadStream(req.files.inputFile.tempPath);
  console.log("mimetype: " + req.files.inputFile.mimetype);

  const params = {
    Bucket: "my-global-origin-bucket",
    Key: req.files.inputFile.name,
    ContentType: req.files.inputFile.mimetype,
    Body: fileStream
  };

  s3.upload(params, function (err, data) {
    if (err) {
      console.log("Error in uploading file", err);
      return res.status(500).send(`Cannot upload the file. ${err}`);
    } else {
      deleteTempFile(req.files.inputFile.tempPath);
      updateDatabase();
      console.log(`File uploaded successfully. ${data.Location}`);
      return res.status(200).send(`File uploaded successfully. ${data.Location}`);
    }
  });

  function updateDatabase() {
    console.log(`userName: ${req.body.userName}`);
    console.log(`FileName: ${req.files.inputFile.name}`);
    const currentTime = new Date().toString();
    console.log(`currentTime: ${currentTime}`);
    const userName = req.body.userName;
    console.log(req.body);
    const description = req.body.description;
    const fileName = req.files.inputFile.name;
    const userId = `${userName}_${fileName}`;
    console.log(`userId: ${userId}`);
    console.log(`description: ${description}`);

    getUserDetails(userName)
      .then(userDetails => {
        if (userDetails) {
          const { givenName, familyName } = userDetails;
          console.log(`User Details: First Name - ${givenName}, Last Name - ${familyName}`);

          dynamoDB.scan({
            TableName: 'Users',
          }, function (err, data) {
            if (err) {
              console.log("Error", err);
            } else {
              console.log("Success", data.Items);
              const foundItems = data.Items.filter(item => item.userId.S === userId);
              if (foundItems.length > 0) {
                console.log("File already exists, so updating it", foundItems);
                const foundItem = foundItems[0];
                console.log("Updating File item ", foundItem);
                uploadItem(userId, userName, fileName, description, foundItem.fileCreatedTime.S, `${givenName} ${familyName}`);
              } else {
                console.log("It is a new file, so creating a new record ", userId);
                uploadItem(userId, userName, fileName, description, currentTime, `${givenName} ${familyName}`);
              }
            }
          });
        } else {
          console.log("User details not found for userName:", userName);
        }
      })
      .catch(err => {
        console.log("Error fetching user details:", err);
      });
  }
});

function getUserDetails(userName) {
  return new Promise((resolve, reject) => {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
      TableName: 'UserDetails',
      Key: {
        'username': userName
      }
    };
    docClient.get(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data.Item);
      }
    });
  });
}

function uploadItem(userId, userName, fileName, description, fileCreationTime, uploadedBy) {
  const ddbparams = {
    TableName: 'Users',
    Item: {
      'userId': { S: userId },
      'userName': { S: userName },
      'fileName': { S: fileName },
      'description': { S: description },
      'fileCreatedTime': { S: fileCreationTime },
      'fileUpdatedTime': { S: new Date().toString() },
      'uploadedBy': { S: uploadedBy }
    }
  };

  dynamoDB.uploadItem(ddbparams, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
}

app.get('/getAdminData', function (req, res) {
  AWS.config.update({
    region: "us-east-1",
    endpoint: "http://dynamodb.us-east-1.amazonaws.com",
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });
  
  var docClient = new AWS.DynamoDB.DocumentClient();
  var params = {
    TableName: 'Users',
  };

  // Call DynamoDB to read the item from the table
  docClient.scan(params, function (err, data) {
    if (err) {
      console.log("Error", err);
      return res.status(500).send(`Can not get the data. ${err}`);
    } else {
      console.log("Success", data.Items);
      return res.status(200).json(data.Items);
      //return res.status(200).json(data);
    }
  });
});


  
  app.get('/getNonAdminData/:userName', function (req, res) {
    AWS.config.update({
      region: "us-east-1",
      endpoint: "http://dynamodb.us-east-1.amazonaws.com",
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
    
    var docClient = new AWS.DynamoDB.DocumentClient();
    
    var table = "Users";
    const userNameParam = req.params.userName;
    console.log("userName:" + userNameParam);
    var params = {
        TableName: table,
        FilterExpression: '#userName = :userName',
        ExpressionAttributeNames: {
          '#userName' : 'userName'
        },
        ExpressionAttributeValues: {
          ':userName' : userNameParam
        }
  
    };
    
    docClient.scan(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            return res.status(500).send(`Can not get the data. ${err}`);
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            return res.status(200).json(data.Items);
        }
    });
    
  });
  
  app.delete('/delete_file', function (req, res) {
    console.log("REQUEST param ", req.body);
    if (!req.body || !req.body.hasOwnProperty('deleteFile')) {
      return res.status(400).send('deleteFile missing in body');
    }
  
    const fileDeletePath = req.body.deleteFile;
    const userId = req.body.userId;
    const fileName = req.body.deleteFile;
  
    const params = {
      Bucket: "my-global-origin-bucket",
      Key: fileDeletePath
    };
  
    s3.deleteFromS3(params, function (err, data) {
      if (err) {
        console.log("Error in deleting file", err);
        return res.status(500).send(`Cannot delete the file. ${err}`);
      } else {
        deleteFromDynamoDB();
        console.log(`File deleted successfully.`);
        return res.status(200).send(`File deleted successfully.`);
      }
    });
  
    function deleteFromDynamoDB() {
      console.log("File Name: ", fileName);
      console.log("userId: ", userId);
      const ddbparams = {
        TableName: 'Users',
        Key: {
          "userId": { "S": userId },
          "fileName": { "S": fileName }
        }
      };
  
      dynamoDB.deleteItem(ddbparams, function (err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          console.log("Success", data);
        }
      });
    }
  });

  
  app.listen(port, () => console.log(`Cloud project app listening on port ${port}!`));
  