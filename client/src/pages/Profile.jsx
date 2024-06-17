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
  const [userListings, setUserListings] = useState([]);
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

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch(`/api/user/delete/${currentUser.data.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      dispatch(deleteUserSuccess());
      dispatch(setSuccess(data));
    } catch (error) {
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

  const handleShowListings = async () => {
    try {
      const res = await fetch(`/api/user/listings/${currentUser.data.id}`, {
        method: "GET",
      });
      const data = await res.json();
      if (!data.success) {
        dispatch(setError(data.message));
        return;
      }
      console.log("DATA", data);
      for (let i = 0; i < data.data.length; i++) {
        data.data[i].imageUrls = JSON.parse(data.data[i].imageUrls);
      }
      setUserListings(data.data);
    } catch (error) {
      dispatch(setError(error.message));
    }
  };

  const handleListingDelete = async () => {};

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
        <span
          onClick={handleDeleteAccount}
          className="cursor-pointer text-red-700"
        >
          Delete account
        </span>
        <span onClick={handleSignOut} className="cursor-pointer text-red-700">
          Sign out
        </span>
      </div>

      <button onClick={handleShowListings} className="text-green-700 w-full">
        Show Listings
      </button>

      {userListings && userListings.length > 0 && (
        <div className="flex flex-col gap -4">
          <h1 className="text-center mt-7 text-2xl font-semibold">
            Your Listings
          </h1>

          {userListings.map((listing) => (
            <div
              key={listing.id}
              className="border rounded-lg p-3 flex justify-between items-center gap-4"
            >
              <Link to={`/listing/${listing.id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt="listing cover"
                  className="h-16 w-16 object-contain"
                />
              </Link>

              <Link
                to={`/listing/${listing.id}`}
                className="text-slate-700 font-semibold hover:underline truncate flex-1"
              >
                <p>{listing.name}</p>
              </Link>

              <div className="flex flex-col item-center">
                <button
                  onClick={() => handleListingDelete(listing.id)}
                  className="text-red-700 uppercase"
                >
                  Delete
                </button>
                <Link to={`/update-listing/${listing.id}`}>
                  <button className="text-green-700 uppercase">Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
