"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./context/AuthProvider";
import AuthModal from "./components/auth/AuthModal";
import ImageModal from "./components/ImageModal";
import IntroNavModal from "./components/IntroNavModal";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "./firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { AiOutlineArrowRight } from "react-icons/ai";
import StatusModal from "./components/StatusModal";
import Link from "next/link";

export default function Home() {
    const { ...profileProps } = useContext(AuthContext);
    const { profile, setProfile } = profileProps;
    const router = useRouter();

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [statusModalProps, setStatusModalProps] = useState<any>({
        type: undefined,
        isSuccess: undefined,
        message: undefined,
    });

    function loginUser(email: string, password: string) {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                setProfile({
                    authenticated: true,
                    email: userCredential.user.email,
                    uid: userCredential.user.uid,
                });

                setStatusModalProps({
                    type: "user_authentication",
                    isSuccess: true,
                    message:
                        "Successfully authenticated! We are shortly redirecting you.",
                });
                setShowModal(true);

                setTimeout(() => {
                    setShowModal(false);
                }, 5000);

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

                console.error(`Error with authencation: ${error}`);

                setStatusModalProps({
                    type: "user_authentication",
                    isSuccess: false,
                    message:
                        "Failed authenticating! You may shortly try again.",
                });
                setShowModal(true);

                setTimeout(() => {
                    setShowModal(false);
                }, 5000);
            });
    }

    useEffect(() => {
        console.log(`Authenticated: ${profile?.authenticated}`);
    }, []);

    return (
        <main className='w-screen h-screen bg-gradient-to-r from-gray-100 flex flex-row md:gap-3 justify-center items-center to-gray-300 relative'>
            <AnimatePresence>
                {showModal && (
                    <StatusModal
                        key={4}
                        {...statusModalProps}
                        setShowModal={setShowModal}
                    />
                )}
            </AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5 }}
                // className='relative'
                className='relative max-sm:w-full flex justify-center items-center'
            >
                <AuthModal
                    mode='login'
                    emailValue={loginEmail}
                    emailHandler={setLoginEmail}
                    passwordValue={loginPassword}
                    passwordHandler={setLoginPassword}
                    authHandler={loginUser}
                />
                {profile?.authenticated && (
                    <motion.button
                        initial={{ opacity: 0, scale: 1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5 }}
                        className='transition absolute hover mt-3 bg-green-600 rounded-xl shadow py-2 px-3'
                    >
                        <Link
                            href='/main'
                            className='font-extrabold text-sm tracking-wider text-white flex flex-row items-center gap-1'
                        >
                            <h3>Redirect to Main</h3>
                            <AiOutlineArrowRight className='text-white text-xl' />
                        </Link>
                    </motion.button>
                )}
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
