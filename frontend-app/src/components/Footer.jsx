import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full mt-10 border-t bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-10 items-center">
        <div>
          <Link to="/" className="text-2xl font-bold text-black">
            Civigil
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-6 text-black text-sm">
          <Link to="/dashboard" className="hover:text-neutral-600">Dashboard</Link>
          <Link to="/track" className="hover:text-neutral-600">Track</Link>
        </div>

        <div className="flex md:justify-end">
          <Link
            to="/report"
            className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-neutral-700"
          >
            Create Report
          </Link>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 py-4">
        &copy; {new Date().getFullYear()} CiVigil. All rights reserved.
      </div>
    </footer>
  );
}