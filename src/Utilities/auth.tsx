import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchAuthSession,
  getCurrentUser,
  signInWithRedirect,
  signOut,
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

const ADMIN_EMAILS = new Set([
  "t.sondra1947@gmail.com",
  "sondratulalaphotography@gmail.com",
]);

export interface AuthUser {
  username: string;
  userId: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signingIn: boolean;
  authError: string;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
  refreshUser: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AmplifyAuthError {
  message?: unknown;
  name?: unknown;
  recoverySuggestion?: unknown;
}

const getSignInErrorMessage = (error: unknown) => {
  const authError =
    error && typeof error === "object" ? (error as AmplifyAuthError) : {};
  const name = typeof authError.name === "string" ? authError.name : "";
  const message =
    typeof authError.message === "string" ? authError.message : "";
  const recoverySuggestion =
    typeof authError.recoverySuggestion === "string"
      ? authError.recoverySuggestion
      : "";

  if (
    name === "SecurityError" ||
    name === "NotAllowedError" ||
    /frame|navigation|navigate|permission|sandbox/i.test(message)
  ) {
    return (
      "This browser window blocked the Google redirect. " +
      `Open ${window.location.origin} in Edge, Chrome, or Firefox and try again.`
    );
  }

  const details = [name, message].filter(Boolean).join(": ");
  if (details) {
    return `Google sign-in could not start. ${details}${
      recoverySuggestion ? ` ${recoverySuggestion}` : ""
    }`;
  }

  return "Google sign-in could not start. Please refresh the page and try again.";
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState("");

  const refreshUser = useCallback(async () => {
    try {
      const [currentUser, session] = await Promise.all([
        getCurrentUser(),
        fetchAuthSession(),
      ]);
      const idTokenPayload = session.tokens?.idToken?.payload;
      const tokenEmail = idTokenPayload?.email;
      const email =
        typeof tokenEmail === "string" ? tokenEmail.toLowerCase() : "";
      const groups = idTokenPayload?.["cognito:groups"];
      const isInAdminGroup =
        Array.isArray(groups) && groups.some((group) => group === "Admins");

      setUser({
        username: currentUser.username,
        userId: currentUser.userId,
        email,
        // The email allowlist keeps the UI usable while the Cognito group is
        // being deployed. AWS permissions must still require the Admins group.
        isAdmin: isInAdminGroup || ADMIN_EMAILS.has(email),
      });
      return true;
    } catch {
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      if (
        payload.event === "signedIn" ||
        payload.event === "signInWithRedirect" ||
        payload.event === "tokenRefresh"
      ) {
        void refreshUser();
      }
      if (payload.event === "signedOut") {
        setUser(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [refreshUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signingIn,
      authError,
      signIn: async () => {
        setAuthError("");
        if (window.self !== window.top) {
          setAuthError(
            "Google sign-in cannot open inside the VS Code preview. " +
              `Open ${window.location.origin} in Edge, Chrome, or Firefox.`,
          );
          return;
        }

        setSigningIn(true);
        try {
          await signInWithRedirect({ provider: "Google" });
        } catch (error) {
          const errorName =
            error && typeof error === "object" && "name" in error
              ? String(error.name)
              : "";

          if (errorName === "UserAlreadyAuthenticatedException") {
            const restored = await refreshUser();
            if (restored) {
              setSigningIn(false);
              return;
            }

            // getCurrentUser can recognize expired cached tokens even when the
            // session can no longer be refreshed. Clear that local OAuth
            // session so the next Google sign-in can start cleanly.
            try {
              await signOut();
              setAuthError(
                "The expired session was cleared. Select Sign in again.",
              );
            } catch (signOutError) {
              console.error("The stale session could not be cleared:", signOutError);
              setAuthError(getSignInErrorMessage(signOutError));
            }
            setSigningIn(false);
            return;
          }

          console.error("Google sign-in could not start:", error);
          setAuthError(getSignInErrorMessage(error));
          setSigningIn(false);
        }
      },
      signOutUser: async () => {
        await signOut();
      },
      refreshUser,
    }),
    [authError, loading, refreshUser, signingIn, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const UseAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("UseAuth must be used inside AuthProvider.");
  }
  return context;
};

export default UseAuth;
