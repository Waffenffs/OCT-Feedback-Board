"use client";

import { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

export const AuthContext = createContext<TAuthContext | undefined>(undefined);

type TAuthContext = {
    profile: TUser | undefined;
    setProfile: React.Dispatch<React.SetStateAction<TUser | undefined>>;
};

type TUser = {
    authenticated: boolean;
    email: string | null;
    uid: string | number;
};

export function AuthProvider({ children }: React.PropsWithChildren) {
    const [profile, setProfile] = useState<TUser | undefined>(undefined);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setProfile({
                    authenticated: true,
                    email: user.email,
                    uid: user.uid,
                });
            } else {
                setProfile({
                    authenticated: false,
                    email: "undefined",
                    uid: "undefined",
                });
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ profile, setProfile }}>
            {children}
        </AuthContext.Provider>
    );
}
