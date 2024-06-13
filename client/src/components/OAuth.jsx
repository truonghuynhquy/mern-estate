import { useEffect } from "react";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signInSuccess } from "../redux/user/userSlice";

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleRedirectResult = async () => {
      const auth = getAuth(app);
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const res = await fetch("/api/auth/google", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: result.user.displayName,
              email: result.user.email,
              photo: result.user.photoURL,
            }),
          });

          if (!res.ok) {
            throw new Error("Failed to authenticate with Google");
          }

          const data = await res.json();
          dispatch(signInSuccess(data));
          navigate("/");
        }
      } catch (error) {
        console.error("Could not sign in with Google", error);
      }
    };

    handleRedirectResult();
  }, [dispatch, navigate]);

  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });
    const auth = getAuth(app);

    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Could not sign in with Google", error);
    }
  };

  return (
    <button
      onClick={handleGoogleClick}
      type="button"
      className="bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-95"
    >
      Continue with Google
    </button>
  );
}
