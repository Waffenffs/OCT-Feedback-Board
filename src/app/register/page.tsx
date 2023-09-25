"use client";

import AuthModal from "../components/auth/AuthModal";
import { useState, useContext } from "react";
import ImageModal from "../components/ImageModal";
import IntroNavModal from "../components/IntroNavModal";
import { motion } from "framer-motion";
import { auth, db } from "../firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { AuthContext } from "../context/AuthProvider";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Register() {
    const router = useRouter();

    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");

    const { ...profileProps } = useContext(AuthContext);
    const { profile, setProfile } = profileProps;

    async function initializeUserInstance(email: string, uid: any) {
        try {
            await setDoc(doc(db, "users", uid), {
                email: email,
            });
        } catch (error) {
            throw new Error(`Error: ${error}`);
        }
    }

    function registerUser(email: string, password: string) {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // If successful,
                setProfile({
                    authenticated: true,
                    email: userCredential.user.email,
                    uid: userCredential.user.uid,
                });

                initializeUserInstance(email, userCredential.user.uid);

                return router.push("/");
            })
            .catch((error) => {
                // If unsuccessful, render an unsuccessful message.
                setProfile({
                    authenticated: false,
                    email: "undefined",
                    uid: "undefined",
                });

                console.error(`Error with authentication: ${error}`);
            });
    }

    return (
        <main className='w-full h-full bg-gradient-to-r from-gray-100 to-gray-300 flex flex-row gap-3 justify-center items-center relative'>
            <motion.div
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5 }}
            >
                <AuthModal
                    mode='register'
                    emailValue={registerEmail}
                    emailHandler={setRegisterEmail}
                    passwordValue={registerPassword}
                    passwordHandler={setRegisterPassword}
                    authHandler={registerUser}
                />
            </motion.div>
            <motion.div
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
            >
                <section className='hidden lg:flex flex-col gap-5 justify-start w-[34rem]'>
                    <ImageModal image_src='https://scontent.fmnl33-2.fna.fbcdn.net/v/t39.30808-6/370539419_699418412200273_5572877249608660172_n.jpg?stp=dst-jpg_s600x600&_nc_cat=106&ccb=1-7&_nc_sid=813123&_nc_eui2=AeESkJ1b7B-uH4E41tcDFtKF8ZL3aIQk8AzxkvdohCTwDOsRNn3VuiBrNwvzk7CL9nUTNwDYHe1Y66-6g12jryIB&_nc_ohc=BUV6wVn5_M0AX_aRJXm&_nc_ht=scontent.fmnl33-2.fna&oh=00_AfBEwDcVQkXU5dlv2dxJqxahdqOewYF7r6aGq4Qx3E9rfQ&oe=6511B799' />
                    <IntroNavModal />
                </section>
            </motion.div>
        </main>
    );
}
