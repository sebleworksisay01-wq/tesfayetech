import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  reload,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, UserRole } from '../types';

export const ADMIN_BOOTSTRAP_EMAIL = 'sebleworksisay01@gmail.com';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isVerified: boolean;
  loading: boolean;
  error: string | null;
  unverifiedEmail: string | null;
  registerUser: (fullName: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginUser: (email: string, password: string) => Promise<{ success: boolean; unverified?: boolean; message?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  logoutUser: () => Promise<void>;
  resendVerification: (targetEmail?: string, targetPassword?: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  refreshAuthStatus: () => Promise<boolean>;
  updateUserProfileData: (data: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
  initializeAdminRole: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Helper to fetch user profile & admin status
  const fetchUserData = useCallback(async (firebaseUser: User) => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      const isBootstrapAdmin = Boolean(firebaseUser.email && firebaseUser.email.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase());

      let profile: UserProfile | null = null;
      if (userSnap.exists()) {
        profile = userSnap.data() as UserProfile;
        setUserProfile(profile);
      } else {
        // If profile doesn't exist (e.g. Google Sign In first time)
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          fullName: firebaseUser.displayName || 'IT Professional',
          email: firebaseUser.email || '',
          role: isBootstrapAdmin ? 'admin' : 'member',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        try {
          await setDoc(userDocRef, newProfile);
          profile = newProfile;
          setUserProfile(profile);
        } catch (setErr) {
          console.warn('Initial profile creation notice:', setErr);
          // If saving as admin had any restriction, fallback to member role
          if (newProfile.role === 'admin') {
            try {
              newProfile.role = 'member';
              await setDoc(userDocRef, newProfile);
              profile = newProfile;
              setUserProfile(profile);
            } catch (fallbackErr) {
              console.warn('Fallback profile creation notice:', fallbackErr);
            }
          }
        }
      }

      // Check admin status:
      // 1. Bootstrap user email
      // 2. Admins collection document existence
      let hasAdminDoc = false;

      try {
        const adminDocRef = doc(db, 'admins', firebaseUser.uid);
        const adminSnap = await getDoc(adminDocRef);
        hasAdminDoc = adminSnap.exists();
        
        // Auto-bootstrap admin document if this is the designated bootstrap admin
        if (isBootstrapAdmin && !hasAdminDoc) {
          await setDoc(adminDocRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            grantedAt: new Date().toISOString(),
            grantedBy: 'system-bootstrap',
          });
          hasAdminDoc = true;
        }
      } catch (err) {
        console.warn('Admin check notice:', err);
      }

      const adminResolved = isBootstrapAdmin || hasAdminDoc || profile?.role === 'admin';
      setIsAdmin(adminResolved);

      // Fallback in-memory profile if Firestore write is pending
      if (!profile) {
        setUserProfile({
          uid: firebaseUser.uid,
          fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'IT Professional',
          email: firebaseUser.email || '',
          role: adminResolved ? 'admin' : 'member',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('User data retrieval notice:', err);
      // Ensure user profile is at least populated in memory so UI does not break
      const isBootstrap = Boolean(firebaseUser.email && firebaseUser.email.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase());
      setIsAdmin(isBootstrap);
      setUserProfile((prev) => prev || {
        uid: firebaseUser.uid,
        fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'IT Professional',
        email: firebaseUser.email || '',
        role: isBootstrap ? 'admin' : 'member',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!firebaseUser.emailVerified && firebaseUser.providerData.some(p => p.providerId === 'password')) {
          // If password user is not email verified, store unverified email and sign out
          setUnverifiedEmail(firebaseUser.email);
          await signOut(auth);
          setUser(null);
          setUserProfile(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setUser(firebaseUser);
        setUnverifiedEmail(null);
        await fetchUserData(firebaseUser);
      } else {
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  // Register function: Creates user, creates Firestore profile with role 'member', sends verification email, signs out
  const registerUser = async (fullName: string, email: string, password: string) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const newUser = userCredential.user;

      // Always assign 'member' role initially
      const role: UserRole = newUser.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase() ? 'admin' : 'member';
      const initialProfile: UserProfile = {
        uid: newUser.uid,
        fullName: fullName.trim(),
        email: newUser.email || email.trim(),
        role,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'users', newUser.uid), initialProfile);
      } catch (docErr) {
        handleFirestoreError(docErr, OperationType.CREATE, `users/${newUser.uid}`);
      }

      // Send email verification link
      await sendEmailVerification(newUser);

      // Sign the user out until email verification is complete
      await signOut(auth);
      setUnverifiedEmail(email.trim());

      return {
        success: true,
        message: 'Account created successfully! We sent a verification email to ' + email.trim() + '. Please verify your email before logging in.',
      };
    } catch (err: unknown) {
      let friendlyMsg = 'An error occurred during registration. Please try again.';
      if (err instanceof Error) {
        if (err.message.includes('auth/email-already-in-use')) {
          friendlyMsg = 'An account with this email address already exists. Please log in or use password recovery.';
        } else if (err.message.includes('auth/weak-password')) {
          friendlyMsg = 'Password is too weak. Please use at least 8 characters with letters, numbers, and symbols.';
        } else if (err.message.includes('auth/invalid-email')) {
          friendlyMsg = 'Invalid email address format. Please check and try again.';
        } else {
          friendlyMsg = err.message;
        }
      }
      setError(friendlyMsg);
      return { success: false, message: friendlyMsg };
    }
  };

  // Login function
  const loginUser = async (email: string, password: string) => {
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const loggedUser = cred.user;

      // Check email verification
      if (!loggedUser.emailVerified) {
        setUnverifiedEmail(email.trim());
        await signOut(auth);
        return {
          success: false,
          unverified: true,
          message: 'Your email address has not been verified yet. Please check your inbox or click resend below.',
        };
      }

      // Check account status in Firestore
      const userDoc = await getDoc(doc(db, 'users', loggedUser.uid));
      if (userDoc.exists()) {
        const prof = userDoc.data() as UserProfile;
        if (prof.status === 'suspended') {
          await signOut(auth);
          return {
            success: false,
            message: 'Your account has been suspended by an administrator. Please contact support.',
          };
        }
      }

      await fetchUserData(loggedUser);
      return { success: true };
    } catch (err: unknown) {
      let msg = 'Failed to sign in. Please verify your credentials.';
      if (err instanceof Error) {
        if (err.message.includes('auth/user-not-found') || err.message.includes('auth/wrong-password') || err.message.includes('auth/invalid-credential')) {
          msg = 'Invalid email or password. Please check your details and try again.';
        } else if (err.message.includes('auth/user-disabled')) {
          msg = 'This account has been disabled. Please contact the administrator.';
        } else if (err.message.includes('auth/too-many-requests')) {
          msg = 'Too many failed login attempts. Please reset your password or try again later.';
        } else if (err.message.includes('network-request-failed')) {
          msg = 'Network connection failure. Please check your internet connection.';
        } else {
          msg = err.message;
        }
      }
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // Google Sign-In
  const loginWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await fetchUserData(cred.user);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google authentication failed';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // Logout
  const logoutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setIsAdmin(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Resend verification email
  const resendVerification = async (targetEmail?: string, targetPassword?: string) => {
    try {
      let activeUser = auth.currentUser;
      if (!activeUser && targetEmail && targetPassword) {
        const cred = await signInWithEmailAndPassword(auth, targetEmail, targetPassword);
        activeUser = cred.user;
      }

      if (activeUser) {
        await sendEmailVerification(activeUser);
        if (!activeUser.emailVerified) {
          await signOut(auth);
        }
        return {
          success: true,
          message: 'A fresh verification link has been sent to your email address. Please check your inbox and spam folder.',
        };
      }
      return {
        success: false,
        message: 'Unable to resend verification. Please log in with your credentials to trigger a new link.',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to resend verification email';
      return { success: false, message: msg };
    }
  };

  // Password reset
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return {
        success: true,
        message: 'Password reset link sent! Check your inbox for instructions to reset your password.',
      };
    } catch (err: unknown) {
      let msg = 'Failed to send password reset email.';
      if (err instanceof Error) {
        if (err.message.includes('auth/user-not-found')) {
          msg = 'No account found with this email address.';
        } else {
          msg = err.message;
        }
      }
      return { success: false, message: msg };
    }
  };

  // Refresh auth status
  const refreshAuthStatus = async () => {
    if (auth.currentUser) {
      await reload(auth.currentUser);
      const isNowVerified = auth.currentUser.emailVerified;
      if (isNowVerified) {
        setUser(auth.currentUser);
        await fetchUserData(auth.currentUser);
        return true;
      }
    }
    return false;
  };

  // Update profile
  const updateUserProfileData = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('Not authenticated');
    try {
      const userRef = doc(db, 'users', user.uid);
      const updatedData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      // Prevent member from modifying role or status via profile edit
      if (!isAdmin) {
        delete (updatedData as Record<string, unknown>).role;
        delete (updatedData as Record<string, unknown>).status;
      }
      await setDoc(userRef, updatedData, { merge: true });
      setUserProfile(prev => prev ? { ...prev, ...updatedData } : null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  // Initialize admin role manually
  const initializeAdminRole = async () => {
    if (!user) return false;
    try {
      await setDoc(doc(db, 'admins', user.uid), {
        uid: user.uid,
        email: user.email,
        grantedAt: new Date().toISOString(),
        grantedBy: 'manual-initialization',
      });
      await setDoc(doc(db, 'users', user.uid), { role: 'admin' }, { merge: true });
      setIsAdmin(true);
      setUserProfile(prev => prev ? { ...prev, role: 'admin' } : null);
      return true;
    } catch (err) {
      console.error('Failed to initialize admin role:', err);
      return false;
    }
  };

  const isVerified = Boolean(user && user.emailVerified);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        isVerified,
        loading,
        error,
        unverifiedEmail,
        registerUser,
        loginUser,
        loginWithGoogle,
        logoutUser,
        resendVerification,
        resetPassword,
        refreshAuthStatus,
        updateUserProfileData,
        clearError,
        initializeAdminRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
