import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setError, setLoading } from "../redux/errorAlert/errorSlice";
import { Link, useNavigate } from "react-router-dom";

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const { loading } = useSelector((state) => state.loading);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(setLoading(true));
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.success) {
        dispatch(setLoading(true));
        dispatch(setError(data.message));
        return;
      }
      navigate("/sign-in");
    } catch (error) {
      dispatch(setLoading(true));
      dispatch(setError(error.message));
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-auto text-gray-800 font-sans overflow-hidden sm:h-[56rem]">
      <div className="w-1/2 flex flex-col items-center justify-center p-6 relative">
        <div className="w-full py-6">
          <div className="flex justify-center items-center text-lg leading-none mx-auto w-36">
            <h1 className="font-bold sm:text-xl flex flex-wrap flex-shrink-0 ">
              <span
                className="text-slate-500 text-3xl"
                style={{ marginRight: "0.25rem" }}
              >
                Welcome
              </span>
              <span className="text-slate-700 text-3xl">to</span>
            </h1>
          </div>
        </div>

        <div className="w-[352px] flex-shrink-0 my-6 h-min">
          <h1 className="text-2xl mb-6 text-center font-semibold ">Sign Up</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Username"
              className="border p-3 rounded-lg"
              id="username"
              onChange={handleChange}
            />
            <input
              type="email"
              placeholder="Email"
              className="border p-3 rounded-lg"
              id="email"
              onChange={handleChange}
            />
            <input
              type="password"
              placeholder="Password"
              className="border p-3 rounded-lg"
              id="password"
              onChange={handleChange}
            />

            <button
              disabled={loading}
              className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disable:opacity-80"
            >
              {loading ? "Loading..." : "Sign Up"}
            </button>
          </form>

          <div className="flex gap-2 mt-5">
            <p>Have an account?</p>
            <Link to={"/sign-in"}>
              <span className="text-blue-700">Sign in</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="w-1/2 p-6 hidden  sm:block max-lg:h-1/2">
        <img
          className="block object-cover w-full pt-3 h-full lg:h-[56rem]"
          src="https://codetheworld.io/wp-content/uploads/2024/03/tokyo.jpg"
        />
      </div>
    </div>
  );
}
