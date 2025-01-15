import { Container, Navbar, Nav } from "react-bootstrap";
import "./navbar.css";
import UseAuth from "../Utilities/auth";
import SacFont from "../Utilities/fonts";



const NavBar = () => {
  SacFont();
  const { user, signInWithRedirect, signOut } = UseAuth();

  return (
    <Navbar collapseOnSelect expand="sm" sticky="top" className="navbar">
      <Container>
        <Navbar.Brand href="/">
          <div className="font-loader">Sondra Tulala Photography</div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-end">
          <Nav className="align-items-center mx-auto text-center">
            <Nav.Link href="/" className="nav-link fs-5">
              Home
            </Nav.Link>
            <Nav.Link href="/about" className="nav-link fs-5">
              About
            </Nav.Link>
            <Nav.Link href="/portfolio" className="nav-link fs-5">
              Portfolio
            </Nav.Link>
            <Nav.Link href="/contact" className="nav-link fs-5">
              Contact
            </Nav.Link>
            {user ? ( 
              <Nav.Link className="nav-link fs-5" onClick={() => signOut()}>
                Sign Out
              </Nav.Link>
            ) : (
              <Nav.Link
                className="nav-link fs-5"
                onClick={() => signInWithRedirect({ provider: "Google" })}
              >
                Sign In
              </Nav.Link>
            )}
          </Nav>
           {user && <div className="user">{"tulalam"}</div>}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
