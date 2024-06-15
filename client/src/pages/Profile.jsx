import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { Link } from "react-router-dom";
import { setError, setSuccess } from "../redux/errorAlert/errorSlice";

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser } = useSelector((state) => state.user);
  const { loading } = useSelector((state) => state.error);
  const [file, setFile] = useState(undefined);
  const [filePercentage, setFilePercentage] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [fileUploadSuccess, setFileUploadSuccess] = useState(false);
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

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
        console.error("Error during file upload:", error);
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
            dispatch(setSuccess("Image successfully uploaded!"));
          })
          .catch((error) => {
            console.error("Error getting download URL:", error);
            setFileUploadError(true); // An error occurred while retrieving the URL
            dispatch(
              setError("Error Image Upload (image must be less than 2 mb)")
            );
          })
          .finally(() => {
            if (!fileUploadError) {
              dispatch(setError(null)); // Clear error messages when there are no errors
            }
          });
      }
    );
  };

  const renderUploadStatus = () => {
    if (fileUploadError) {
      return;
    } else if (filePercentage > 0 && filePercentage < 100) {
      return (
        <span className="text-slate-700">{`Uploading ${filePercentage}%`}</span>
      );
    } else if (fileUploadSuccess) {
      return;
    } else {
      return ""; // In the default case, nothing is displayed
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>

      <form action="" className="flex flex-col gap-4">
        <input
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser.data.avatar}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
        />

        <p className="text-sm self-center">{renderUploadStatus()}</p>

        <input
          type="text"
          placeholder="Username"
          defaultValue={currentUser.data.username}
          id="username"
          className="border p-3 rounded-lg"
        />
        <input
          type="email"
          placeholder="Email"
          defaultValue={currentUser.data.email}
          id="email"
          className="border p-3 rounded-lg"
        />
        <input
          type="password"
          placeholder="Password"
          id="password"
          className="border p-3 rounded-lg"
        />
        <button
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          Update
        </button>
        <Link
          to="/create-listing"
          className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95"
        >
          Create Listing
        </Link>
      </form>

      <div className="flex justify-between mt-5">
        <span className="text-red-700 cursor-pointer">Delete account</span>
        <span className="text-red-700 cursor-pointer">Sign out</span>
      </div>
    </div>
  );
}
