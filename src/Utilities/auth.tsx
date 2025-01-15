import { Hub } from "aws-amplify/utils";
import { signInWithRedirect, signOut, getCurrentUser } from "aws-amplify/auth";
import { useEffect, useState } from "react";

const UseAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState({
    username: ""
  })

  const getUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      console.log("----")
      console.log(user)
      setUser(currentUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser({username: ""});
    }
  };

  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      switch (payload.event) {
        case "signInWithRedirect":
          getUser();
          break;
        case "signInWithRedirect_failure":
          setError("An error has occurred during the Google OAuth flow.");
          console.error(error);
          break;
        default:
          console.warn("Unhandled auth event:", payload.event);
      }
    });

    getUser();

    return () => unsubscribe();
  }, [error]);

  return { user, signInWithRedirect, signOut };
};

export default UseAuth;