import { Hub } from "aws-amplify/utils";
import { signInWithRedirect, signOut, getCurrentUser } from "aws-amplify/auth";
import { useEffect, useState } from "react";

const UseAuth = () => {
  const [user, setUser] = useState({
    username: ""
  })


  const getUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      console.log("Authenticated user:", currentUser);
      setUser({ username: currentUser.username });
    } catch (error) {
      console.warn("User not authenticated yet.");
      console.log(error)
      setUser({ username: "" });
    }
  };

  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      switch (payload.event) {
        case "signInWithRedirect":
          console.log("OAuth sign-in complete");
          getUser();
          break;
        case "signInWithRedirect_failure":
          console.error("OAuth sign-in failed:", payload.data);
          break;
        default:
          console.warn("Unhandled auth event:", payload.event);
      }
    });
  
    return () => unsubscribe();
  }, []);
  

  return { user, signInWithRedirect, signOut };
};

export default UseAuth;