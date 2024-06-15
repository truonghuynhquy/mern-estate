import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { setError, setSuccess } from "../redux/errorAlert/errorSlice";

export default function Profile() {
  const { currentUser } = useSelector((state) => state.user);
  const fileRef = useRef(null);
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

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>

      <input
        type="file"
        ref={fileRef}
        hidden
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <form action="" className="flex flex-col gap-4">
        <img
          src={formData.avatar || currentUser.data.avatar}
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

        <button className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95">
          Update
        </button>

        <button className="bg-green-700 text-white rounded-lg p-3 uppercase hover:opacity-95">
          Create Listing
        </button>
      </form>

      <div className="flex justify-between mt-4">
        <span className="cursor-pointer text-red-700">Delete account</span>
        <span className="cursor-pointer text-red-700">Sign out</span>
      </div>
    </div>
  );
}
