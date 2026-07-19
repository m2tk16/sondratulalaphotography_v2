import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { List, X } from "react-bootstrap-icons";
import UseAuth from "../Utilities/auth";
import "./navbar.css";

const NavBar = () => {
  const { user, loading, signingIn, authError, signIn, signOutUser } = UseAuth();
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <header className="site-header">
      <Link className="wordmark" onClick={closeMenu} to="/">
        <span>Sondra Tulala</span>
        <small>Photography</small>
      </Link>
      <button
        aria-expanded={open}
        aria-label={open ? "Close navigation" : "Open navigation"}
        className="menu-toggle"
        onClick={() => setOpen(!open)}
        type="button"
      >
        {open ? <X aria-hidden /> : <List aria-hidden />}
      </button>
      <nav className={open ? "primary-nav open" : "primary-nav"} aria-label="Main navigation">
        <NavLink onClick={closeMenu} to="/">Home</NavLink>
        <NavLink onClick={closeMenu} to="/portfolio">Portfolio</NavLink>
        <NavLink onClick={closeMenu} to="/about">About</NavLink>
        <NavLink onClick={closeMenu} to="/contact">Contact</NavLink>
        {user?.isAdmin && (
          <NavLink onClick={closeMenu} to="/admin">Studio</NavLink>
        )}
        {!loading &&
          (user ? (
            <button
              className="auth-link"
              disabled={signingIn}
              onClick={() => {
                closeMenu();
                void signOutUser();
              }}
              type="button"
            >
              Sign out
            </button>
          ) : (
            <button
              className="auth-link"
              onClick={() => {
                closeMenu();
                void signIn();
              }}
              type="button"
            >
              {signingIn ? "Opening Google…" : "Sign in"}
            </button>
          ))}
      </nav>
      {authError && (
        <p className="auth-error-banner" role="alert">
          {authError}
        </p>
      )}
    </header>
  );
};

export default NavBar;
