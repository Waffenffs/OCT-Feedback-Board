"use client";

import { useContext, useState } from "react";
import { AuthContext } from "./context/AuthProvider";
import AuthModal from "./components/auth/AuthModal";
import ImageModal from "./components/ImageModal";
import IntroNavModal from "./components/IntroNavModal";
import { motion } from "framer-motion";
import { auth } from "./firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Home() {
    const { ...profileProps } = useContext(AuthContext);
    const { profile, setProfile } = profileProps;
    const router = useRouter();

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [success, setSuccess] = useState<"Success" | "Unsuccessful" | null>(
        null
    );

    function loginUser(email: string, password: string) {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                setProfile({
                    authenticated: true,
                    email: userCredential.user.email,
                    uid: userCredential.user.uid,
                });

                setSuccess("Success");

                setTimeout(() => {
                    return router.push("/main");
                }, 6000);
            })
            .catch((error) => {
                setProfile({
                    authenticated: false,
                    email: "undefined",
                    uid: "undefined",
                });

                setSuccess("Unsuccessful");

                console.error(`Error with authencation: ${error}`);
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
                    mode='login'
                    emailValue={loginEmail}
                    emailHandler={setLoginEmail}
                    passwordValue={loginPassword}
                    passwordHandler={setLoginPassword}
                    authHandler={loginUser}
                    result={success}
                    setResult={setSuccess}
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
