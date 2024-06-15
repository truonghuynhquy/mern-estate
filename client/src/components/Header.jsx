import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert } from "@mui/material";
import { FaSearch } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { setError, setSuccess } from "../redux/errorAlert/errorSlice";

const Header = () => {
  const { error, success } = useSelector((state) => state.error); // COMMENT: error { error: ...., loading: ... }
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [alertOpen, setAlertOpen] = useState(true);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (error) {
      setAlertOpen(true);
      const timeout = setTimeout(() => {
        setAlertOpen(false);
        dispatch(setError(null)); //  Reset error message
      }, 3000);
      return () => clearTimeout(timeout);
    } else if (success) {
      setSuccessOpen(true);
      const timeout = setTimeout(() => {
        setSuccessOpen(false);
        dispatch(setSuccess(null)); // Reset success message
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [error, success, dispatch]);
  const handleCloseAlert = () => {
    setAlertOpen(!alertOpen);
    setSuccessOpen(!successOpen);
    dispatch(setError(null));
    dispatch(setSuccess(null));
  };

  return (
    <header className="bg-slate-200 shadow-md relative">
      {(error || success) && (
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-6xl p-3">
          <Alert
            severity={error ? "error" : "success"}
            onClose={handleCloseAlert}
          >
            {error || success}
          </Alert>
        </div>
      )}

      <div className="z-10 flex justify-between items-center max-w-6xl mx-auto p-3">
        <Link to="/">
          <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="text-slate-500">Hines</span>
            <span className="text-slate-700">Estate</span>
          </h1>
        </Link>

        <form className="bg-slate-100 p-3 rounded-lg flex items-center">
          <input
            type="text"
            placeholder="Search ...."
            className="bg-transparent focus:outline-none w-24 sm:w-64"
          />
          <button>
            <FaSearch className="text-slate-600" />
          </button>
        </form>

        <ul className="flex gap-4">
          <Link to="/">
            <li className="hidden sm:inline text-slate-700 hover:underline">
              Home
            </li>
          </Link>

          <Link to="/about">
            <li className="hidden sm:inline text-slate-700 hover:underline">
              About
            </li>
          </Link>

          <Link to="/profile">
            {currentUser ? (
              <img
                className="rounded-full h-7 w-7 object-cover"
                src={currentUser.data.avatar}
                alt="profile"
              />
            ) : (
              <li className="text-slate-700 hover:underline">Sign In</li>
            )}
          </Link>
        </ul>
      </div>
    </header>
  );
};

export default Header;
