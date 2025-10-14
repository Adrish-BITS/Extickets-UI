import React from "react";
import { Navbar, Nav, Container, Button, Form, FormControl } from "react-bootstrap";
import "./HomePage.css"; // we'll add custom styling here
import { FaSearch } from "react-icons/fa";

// import heroImage from "https://media.istockphoto.com/id/1458782106/photo/scenic-aerial-view-of-the-mountain-landscape-with-a-forest-and-the-crystal-blue-river-in.jpg?s=2048x2048&w=is&k=20&c=jbXMS_yFujUo29EIjPd8XBsEan-PAHUcPs0Zo1-HY_U=";

function HomePage() {
  return ( <>
    <Navbar expand="lg" className="navbar-dark custom-navbar px-4">
      <Container fluid>
        {/* Logo */}
        <Navbar.Brand href="#" className="d-flex align-items-center">
          <img
            src="/images/ExTickets-logo-white.png"
            alt="ExTickets"
            height="100"
            // className="me-2"
          />
          {/* <span className="brand-text">ExTickets</span> */}
        </Navbar.Brand>

        {/* Mobile Toggle */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        {/* Navbar Links */}
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav className="align-items-center">
            <Nav.Link href="#how-it-works" className="nav-link-custom">
              How it works
            </Nav.Link>
            <Nav.Link href="#how-to-sell" className="nav-link-custom">
              How to sell
            </Nav.Link>
            <Nav.Link href="#partner" className="nav-link-custom">
              Become a partner
            </Nav.Link>
            <Nav.Link href="#login" className="nav-link-custom">
              Log in
            </Nav.Link>
            <Button variant="info" className="sell-button ms-3">
              Sell your tickets
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>

    {/* Hero Section */}
      <section className="hero-section text-center text-white d-flex flex-column justify-content-center align-items-center" 
  //     style={{ 
  //   backgroundImage: `url(${heroImage})`,
  //   backgroundSize: "cover",
  //   backgroundPosition: "center"
  // }
  // }
  >
        <div className="hero-overlay"></div>
        <Container className="position-relative z-2">
          <h1 className="display-4 fw-bold mb-4">
            The safest way to buy and sell tickets
          </h1>

          {/* Search Bar */}
          <Form className="d-flex justify-content-center hero-search-bar">
            <div className="search-wrapper d-flex align-items-center bg-white rounded-pill shadow px-3 py-2 w-75 w-md-50">
              <FaSearch className="text-secondary me-3" />
              <FormControl
                type="search"
                placeholder="Search for an event, artist, venue or city"
                className="border-0 shadow-none flex-grow-1"
              />
            </div>
          </Form>
        </Container>
      </section>
      </>
  );
}

export default HomePage;
