import React, { useState } from 'react';
import { Button } from "react-bootstrap";
import { Link } from 'react-router-dom';

function SignOut(props) {
    const [isSignOut, setIsSignOut] = useState(false);

    function handleSignOutClick() {
        sessionStorage.clear();
        setIsSignOut(true);
    }

    return (
        <div>
            <Link to="/" onClick={handleSignOutClick}>
                <Button variant="danger" style={{ marginLeft: "20px" }}>
                    Sign Out
                </Button>
            </Link>
        </div>
    );
}

export default SignOut;
