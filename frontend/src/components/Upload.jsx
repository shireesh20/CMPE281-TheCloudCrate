import React, { PureComponent } from 'react';
import { dataService } from '../services/dataService';
import { Card, Button } from 'react-bootstrap';

class Upload extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            files: [],
            descr: '',
            result: '',
        };

        this.fileUpload = this.fileUpload.bind(this);
    }

    fileUpload() {
        const userData = this.props.user;
        console.log(`userData: ${userData}`);
        const files = this.state.files;

        if (files.length > 0) {
            // Check file size
            if (files[0].size > 10 * 1024 * 1024) {  // 10 MB in bytes
                alert("File size should not exceed 10MB");
                return;
            }

            dataService.fileUpload(files[0], userData, this.state.descr)
                .then(json => {
                    console.log(json);
                    this.setState({
                        result: "File Uploaded successfully",
                    });

                    // Return a promise to continue the chain
                    return Promise.resolve();
                })
                .then(() => {
                    // After the file is uploaded, refresh the table
                    setTimeout(() => {
                        if (this.props.isAdmin) {
                            this.props.refreshList();
                        } else {
                            this.props.refreshList2(userData);
                        }
                    }, 1500);
                })
                .catch(reason => {
                    console.log(reason);
                    this.props.refreshList();
                });
        }
    }

    render() {
        return (
            <div>
                <Card className="text-center" style={{ margin: '5rem 10rem 2rem 10rem' }}>
                    <Card.Header>Upload Section: {this.state.result} </Card.Header>
                    <Card.Body>
                        <input type="file" style={{ marginLeft: "20px" }} onChange={e => this.setState({
                            files: e.target.files,
                        })} />
                        <input
                            value={this.state.desc}
                            onChange={e => this.setState({
                                descr: e.target.value,
                            })}
                            placeholder="Description"
                            type="text"
                            name="Description"
                            style={{ marginLeft: "40px" }}
                        />
                        &nbsp; &nbsp;
                        <Button onClick={this.fileUpload} style={{ padding: "5px" }}>Upload</Button>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}

export default Upload;
