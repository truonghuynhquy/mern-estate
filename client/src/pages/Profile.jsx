import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import {
  setError,
  setLoading,
  setSuccess,
} from "../redux/errorAlert/errorSlice";
import { Link } from "react-router-dom";
import { deleteUserSuccess, updateUserSuccess } from "../redux/user/userSlice";

export default function Profile() {
  const { currentUser } = useSelector((state) => state.user);
  const { loading } = useSelector((state) => state.error);
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePercentage, setFilePercentage] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [fileUploadSuccess, setFileUploadSuccess] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    avatar: "",
  });
  const dispatch = useDispatch();

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.data.username || "",
        email: currentUser.data.email || "",
        password: "",
        avatar: currentUser.data.avatar || "",
      });
    }
  }, [currentUser]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );

        setFilePercentage(progress);
      },
      (error) => {
        console.error("Error during file upload", error);
        setFileUploadError(true);
        dispatch(setError("Error Image Upload (image must be less than 2 mb)"));
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            setFormData((prevData) => ({
              ...prevData,
              avatar: downloadURL,
            }));

            setFileUploadSuccess(true);
            setFileUploadError(false);
            dispatch(setSuccess("Image Upload Success"));
          })
          .catch((error) => {
            console.error("Error getting download URL:", error);
            setFileUploadError(true); // An error occurred while retrieving the URL
            dispatch(
              setError("Error Image Upload (image must be less than 2 mb)")
            );
          })
          .finally(() => {
            if (!fileUploadError && !fileUploadSuccess) {
              setFilePercentage(0);
              dispatch(setError(null)); // Clear error messages when there are no errors
            }
          });
      }
    );
  };

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(setLoading(true));
      const res = await fetch(`/api/user/update/${currentUser.data.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      dispatch(setLoading(false));
      if (!data.success) {
        dispatch(setError(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      dispatch(setSuccess("Update User Success"));
    } catch (error) {
      dispatch(setLoading(false));
      dispatch(setError(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/auth/signout", { method: "GET" });
      const data = await res.json();

      dispatch(deleteUserSuccess());
      dispatch(setError(data));
    } catch (error) {
      dispatch(setError(error.message));
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <img
          src={formData.avatar}
          alt="profile"
          className="rounded-full h-32 w-32 object-cover cursor-pointer self-center mt-2"
          onClick={() => fileRef.current.click()}
        />

        <p className="text-sm self-center">
          {filePercentage > 0 && filePercentage < 100 && (
            <span className="text-slate-700">{`Uploading: ${filePercentage}%`}</span>
          )}
        </p>

        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          id="username"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          id="email"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />

        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          id="password"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />

        <button
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Loading..." : "Update"}
        </button>

        <Link
          to="/create-listing"
          className="bg-green-700 text-white rounded-lg p-3 uppercase text-center hover:opacity-95"
        >
          Create Listing
        </Link>
      </form>

      <div className="flex justify-between mt-4">
        <span className="cursor-pointer text-red-700">Delete account</span>
        <span onClick={handleSignOut} className="cursor-pointer text-red-700">
          Sign out
        </span>
      </div>
    </div>
  );
}
