import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "@aws-amplify/ui-react/styles.css";
import "./App.css";
import About from "./About/about";
import Admin from "./Admin/admin";
import Contact from "./Contact/contact";
import Footer from "./Footer/footer";
import Home from "./Home/home";
import NavBar from "./Navigation/navbar";
import Portfolio from "./Portfolio/portfolio";
import { AuthProvider } from "./Utilities/auth";
import UseAuth from "./Utilities/auth";

const AdminRoute = () => {
  const { user, loading } = UseAuth();

  if (loading) {
    return <div className="route-status">Checking your account…</div>;
  }
  if (!user) {
    return <Navigate to="/portfolio" replace />;
  }
  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <Admin />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="site-shell">
          <NavBar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<AdminRoute />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
