"use client";

import { useContext, useState } from "react";
import { AuthContext } from "./context/AuthProvider";
import { AnimatePresence, motion } from "framer-motion";
import { auth } from "./firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { PiEyeClosedBold, PiEyeBold } from "react-icons/pi";
import { BsGithub } from "react-icons/bs";

import StatusModal from "./components/StatusModal";
import Link from "next/link";

export default function Home() {
    const { ...profileProps } = useContext(AuthContext);
    const { profile, setProfile } = profileProps;
    const router = useRouter();

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
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

    return (
        <main className='w-screen h-screen relative flex max-sm:justify-center bg-[#e9e9e9] md:justify-between max-sm:items-center overflow-hidden'>
            <AnimatePresence>
                {showModal && (
                    <StatusModal
                        key={4}
                        {...statusModalProps}
                        setShowModal={setShowModal}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {profile && profile?.authenticated && (
                    <motion.article
                        initial={{ opacity: 1, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className='z-20 absolute top-0 max-sm:right-0 md:left-0 shadow-xl flex flex-row justify-between items-center gap-2 text-black bg-green-600 max-sm:rounded-bl-3xl md:rounded-br-3xl font-semibold text-white tracking-wide max-sm:pl-7 max-sm:pr-1 md:pl-2 md:pr-10 md:pb-3 lg:w-[35rem] md:w-[23rem] py-2'
                    >
                        <div>
                            <span>Skip to </span>
                            <Link
                                href='/main'
                                className='py-1 px-5 bg-orange-400 border-2 border-orange-400 rounded-md transition duration-300 hover:bg-green-600 shadow'
                            >
                                <span>Main</span>
                            </Link>
                        </div>

                        <div className='hidden md:flex'>
                            <a
                                href='https://github.com/Waffenffs/OCT-Feedback-Board'
                                target='_blank'
                            >
                                <BsGithub className='text-slate-200 text-xl' />
                            </a>
                        </div>
                    </motion.article>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className='hidden md:flex w-full h-full justify-center items-center px-10'
            >
                <img src='/icon1.svg' alt='...icon' />
            </motion.div>

            <motion.article
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className='bg-white w-full h-full lg:w-[34rem] md:shadow-xl md:w-[40rem] md:mr-5 md:border md:mt-2 md:rounded-t-xl flex flex-col gap-16 md:gap-9 items-center relative'
            >
                <div className='w-28 h-28 mt-14 md:w-24 md:h-24 md:mt-8'>
                    <img
                        src='/oct-logo.png'
                        alt='...logo'
                        className='object-cover'
                    />
                </div>

                <header className='text-center'>
                    <h1 className='font-extrabold tracking-wider text-4xl md:text-3xl mb-3 text-slate-800'>
                        Welcome back!
                    </h1>
                    <h3 className='font-semibold text-sm tracking-wide text-slate-500'>
                        Please enter your details
                    </h3>
                </header>

                <div className='w-80 md:w-64 lg:w-72 flex flex-col gap-10 '>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            loginUser(loginEmail, loginPassword);
                        }}
                        className='flex flex-col '
                    >
                        <div className='w-full flex flex-col gap-1 justify-start mb-3'>
                            <h1 className='font-bold text-gray-700 tracking-wide'>
                                Email
                            </h1>
                            <input
                                type='text'
                                placeholder='Email'
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                required
                                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                            />
                        </div>

                        <div className='w-full flex flex-col gap-1 justify-start mb-10'>
                            <h1 className='font-bold text-gray-700 tracking-wide'>
                                Password
                            </h1>

                            <div className='w-full relative'>
                                <input
                                    type={`${
                                        showPassword ? "text" : "password"
                                    }`}
                                    placeholder='Password'
                                    value={loginPassword}
                                    onChange={(e) =>
                                        setLoginPassword(e.target.value)
                                    }
                                    required
                                    className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                                />

                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowPassword(
                                            (prevState) => !prevState
                                        );
                                    }}
                                    type='button'
                                    className='absolute right-0 cursor-pointer bg-white h-full'
                                >
                                    {showPassword ? (
                                        <PiEyeBold className='text-xl' />
                                    ) : (
                                        <PiEyeClosedBold className='text-xl' />
                                    )}
                                </button>
                            </div>
                        </div>
                        <footer className='mt-10 flex flex-col'>
                            <button
                                onClick={() =>
                                    loginUser(loginEmail, loginPassword)
                                }
                                className='w-full focus:outline-none rounded-2xl bg-green-600 text-white py-2 text-xl font-semibold shadow'
                            >
                                <h2>Log In</h2>
                            </button>
                        </footer>
                    </form>

                    <h4 className='text-sm font-semibold text-slate-500 text-center tracking-wider'>
                        Don&apos;t have an account?{" "}
                        <Link
                            href='/register'
                            className='font-extrabold text-blue-400 tracking-wider'
                        >
                            Sign Up
                        </Link>
                    </h4>
                </div>
            </motion.article>
        </main>
    );
}
