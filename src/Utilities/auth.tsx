import { Hub } from "aws-amplify/utils";
import { signInWithRedirect, signOut, getCurrentUser } from "aws-amplify/auth";
import { useEffect, useState } from "react";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

const UseAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
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
