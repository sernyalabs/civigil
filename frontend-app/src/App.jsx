import { Routes, Route, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Report from "./pages/Report";
import Dashboard from "./pages/Dashboard";
import Track from "./pages/Track";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <Navbar />
      <Toaster position="top-right" />
      <main className="my-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<Report />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/track" element={<Track />} />
          <Route path="/track/:token" element={<Track />} /> 
        </Routes>
      </main>
      <Footer />
    </>
  );
}