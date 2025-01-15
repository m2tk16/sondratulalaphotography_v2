import { Amplify } from 'aws-amplify';
import awsConfig from './aws-exports';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import "@aws-amplify/ui-react/styles.css";
import "./App.css";
import NavBar from "./Navigation/navbar";
import Home from "./Home/home";
import About from "./About/about";
//import Portfolio from "./Portfolio/portfolio";
import Contact from "./Contact/contact";
import Footer from "./Footer/footer";

Amplify.configure(awsConfig);

function App() {
  return (
    <div className="body">
        <Router>
          <NavBar />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<About/>} />
            {/* <Route path='/portfolio' element={<Portfolio/>} /> */}
            <Route path='/contact' element={<Contact/>} />
          </Routes>
          <Footer />
        </Router>
    </div>
  );
}

export default App;