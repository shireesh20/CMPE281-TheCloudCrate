
import React, { PureComponent } from 'react';
import SignOut from './SignOut';
import SignInPage from './SignIn';
import { dataService } from '../services/dataService';
import Upload from './Upload';
import { Button, Navbar, Table } from "react-bootstrap";

var jwt = require('jsonwebtoken');

class UserPage extends PureComponent {
    constructor(props) {
        super(props)

        const sessionToken = sessionStorage.getItem("token")
        // JWT DECODE 
        // Store decoded jwt in session storage

        this.state = {
            userDataDynamo: [],
            userData: undefined,
            desc: "",
            isAdmin: false,
        }
        this.setDescription = this.setDescription.bind(this)
        this.nonAdminUpdate = this.nonAdminUpdate.bind(this)
    }

    setDescription(d) {
        this.setState({
            desc: d
        })
    }

    adminUpdate(user) {
        console.log("Called Update Table");
        dataService.getNonAdminData(user)
            .then(json => {
                console.log(json);
                if (Array.isArray(json)) {
                    this.setState({
                        userDataDynamo: json
                    });
                }
            })
            .catch(reason => {
                console.log("Failed to fetch data from server, reason is : ", reason);
            });
    }
    nonAdminUpdate() {
        console.log("Called Update Table");
        dataService.getAdminData()
            .then(json => {
                console.log(json);
                if (Array.isArray(json)) {
                    this.setState({
                        userDataDynamo: json
                    });
                }
            })
            .catch(reason => {
                console.log("Failed to fetch data from server, reason is : ", reason);
            });
    }
    componentDidMount() {
        
        var token = sessionStorage.getItem("token");
        var decoded = jwt.decode(token);
        // get the decoded payload and header
        var decoded = jwt.decode(token, { complete: true });
        console.log(decoded.header);
        console.log(decoded.payload);
        const userObj = decoded.payload;
        console.log('Decoded User Object:', userObj);
        this.setState({
            userData: userObj
        })
        const isAdmin = userObj && userObj["cognito:groups"] && userObj["cognito:groups"].filter(g => g == "admin").length > 0;

        this.setState({ isAdmin });
        setTimeout(()=> {
            console.log("UserEmailCheckBefore:"+this.state.userData.email)
            console.log("isAdmin:"+this.state.isAdmin)
            if (this.state.isAdmin){
                this.nonAdminUpdate()
            } else {
                this.adminUpdate(this.state.userData.email);
            }
        }, 500);
        
      
        dataService.getUser()
    }
    

    onClickDownLoad(file) {
        window.open("https://d1qjvllgtcc26d.cloudfront.net/" + file);

    }

    onDelete(fileName, id) {
        dataService.deleteFile(fileName, id)
            .then(json => {
                console.log(json);
                setTimeout(()=> {
                if (this.state.isAdmin){
                    this.nonAdminUpdate()
                } else {
                    this.adminUpdate(this.state.userData.email);
                }
            }, 300);
                
            })
            .catch(reason => {
                console.log("Failed to delete, reason is : ", reason);
            });
    }


    render() {
        const { isAdmin } = this.state;
        return (
            <div>
                <Navbar bg="dark" variant="dark" style={{ borderBottom: '2px solid #D3D3D3' }}>
                    <Navbar.Brand>TheCloudCrate</Navbar.Brand>
                    <Navbar.Collapse className="justify-content-end">
                        <Navbar.Text>
                            User: {this.state.userData &&
                                <a href="#SignIn">{this.state.userData.email}</a>}
                            &nbsp;&nbsp;
                            Role: {
                                isAdmin && <a> "Admin" </a>
                            }
                            {
                                !isAdmin && <a> "Non Admin"</a>
                            }
                        </Navbar.Text>
                    </Navbar.Collapse>
                    {this.state.userData && <SignOut></SignOut>}
                    {!this.state.userData && <SignInPage></SignInPage>}
                </Navbar>
                {
                    this.state.userData &&
                    <Upload
                        user={this.state.userData.email}
                        desc={this.state.desc}
                        refreshList={e => this.nonAdminUpdate()}
                        refreshList2={e => this.adminUpdate(e)}
                        isAdmin={isAdmin}
                    >
                    </Upload>
                }
                <div style={{ "margin": "50px" }}>
                    <Table striped bordered hover responsive variant="dark">
                        <thead>
                            <tr key={0}>
                                {
                                    isAdmin &&
                                    <th>User Name</th>
                                }
                                <th>File Name</th>
                                <th>Description</th>
                                <th>Download</th>
                                <th>Delete</th>
                                <th>Uploaded By</th>
                                <th>Upload Time</th>
                                <th>Updated Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.userDataDynamo.map(item => {
                                    return (
                                        <tr key={item.userId}>
                                            {
                                                isAdmin &&
                                                <td>{item.userName}</td>
                                            }
                                            <td>{item.fileName}</td>
                                            <td>{item.description}</td>
                                            <td>
                                                <a 
                                                    href={"https://d1qjvllgtcc26d.cloudfront.net/" + item.fileName} 
                                                    target="_blank"
                                                    download={item.fileName}
                                                    className="btn btn-outline-info"
                                                >
                                                    Download
                                                </a>
                                            </td>
                                            <td><Button variant="outline-danger" onClick={event => this.onDelete(item.fileName, item.userId)}>
                                                Delete
                                            </Button></td>
                                            <td>{item.uploadedBy}</td>
                                            <td>{new Date(item.fileCreatedTime).toLocaleString()}</td>
                                            <td>{new Date(item.fileUpdatedTime).toLocaleString()}</td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </Table>
                </div>
            </div>
        )
    }
}

export default UserPage
