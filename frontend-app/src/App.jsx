import { Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Report from "./pages/Report";
import Dashboard from "./pages/Dashboard";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="my-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<Report />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}