import React from 'react';
import { Button, Navbar, Card } from 'react-bootstrap';
import { useRouteMatch } from 'react-router-dom';

function SignInPage() {
  let { location } = useRouteMatch();
  console.log(location);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center' }}>
      <Navbar bg="light" variant="light" style={{ borderBottom: '2px solid #D3D3D3', position: 'absolute', top: 0, width: '100%' }}>
        <Navbar.Brand>TheCloudCrate</Navbar.Brand>
      </Navbar>

      <Card style={{ width: '18rem', margin: '0 auto', justifyContent: 'center', boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Card.Header style={{ backgroundColor: '#F8F8F8', alignSelf: 'stretch' }}>TheCloudCrate App</Card.Header>
        <Card.Body style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Card.Text></Card.Text>
          <Button variant="success" href="https://cloudcrate.auth.us-east-1.amazoncognito.com/SignIn?client_id=fblq1eenq78m6shr8u229qu54&response_type=token&scope=email+openid+phone+profile&redirect_uri=https%3A%2F%2Fthecloudcrate.online">
            Sign In / Sign Up
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
}

export default SignInPage;
