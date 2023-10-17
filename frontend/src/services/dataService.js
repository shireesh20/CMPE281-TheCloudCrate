global.fetch = require('node-fetch');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

export const dataService = {
    fetchUserData,
    fetchAdminData,
    fileUploadToServer,
    deleteFileFromServer,
    getCurrentUser,
};

export const apiConfig = {
    endpointURL: "https://api.thecloudcrate.online"
};

function fetchUserData(userName) {
    console.log("User: " + userName);
    const requestOptions = {
        method: 'GET',
        headers: { "Content-Type": "application/json" }
    };
    return fetch(`${apiConfig.endpointURL}/getNonAdminData/${userName}`, requestOptions)
        .then(response => {
            console.log(response);
            return response.json();
        });
}

function fetchAdminData() {
    const requestOptions = {
        method: 'GET',
        headers: { "Content-Type": "application/json" }
    };
    return fetch(`${apiConfig.endpointURL}/getAdminData`, requestOptions)
        .then(response => {
            console.log(response);
            return response.json();
        });
}

function fileUploadToServer(inputFile, userData, description) {
    const formData = new FormData();
    formData.append('inputFile', inputFile);
    formData.append('userName', userData);
    formData.append('description', description);
    console.log(`UserName: ${userData}, desc: ${description}`);
    const requestOptions = {
        method: 'POST',
        body: formData,
    };
    return fetch(`${apiConfig.endpointURL}/upload_file`, requestOptions)
        .then(response => {
            console.log(response);
            return response;
        });
}

function deleteFileFromServer(fileName, id) {
    const requestOptions = {
        method: 'DELETE',
        body: JSON.stringify({
            "deleteFile": fileName,
            "userId": id
        }),
        headers: { "Content-Type": "application/json" }
    };
    return fetch(`${apiConfig.endpointURL}/delete_file`, requestOptions);
}

function getCurrentUser() {
    const poolData = {
        UserPoolId: 'us-east-1_ritU4gOZb',
        ClientId: 'fblq1eenq78m6shr8u229qu54',
    };
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    const cognitoUser = userPool.getCurrentUser();

    console.log("Cognito user", cognitoUser);

    if (cognitoUser !== null) {
        cognitoUser.getSession(function (err, session) {
            if (err) {
                alert(err.message || JSON.stringify(err));
                return;
            }
            console.log('Session validity: ' + session.isValid());

            cognitoUser.getUserAttributes(function (err, attributes) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Attributes:', attributes);
                }
            });
        });
    }
}
