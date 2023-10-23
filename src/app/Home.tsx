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
        <main className='w-screen h-screen relative flex max-sm:justify-center md:bg-[#e9e9e9] md:justify-between max-sm:items-center overflow-hidden'>
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

            <div className='hidden md:flex w-full h-full justify-center items-center px-10'>
                <img src='/icon1.svg' alt='...icon' />
            </div>

            <article className='bg-white w-full h-full lg:w-[34rem] md:shadow-xl md:w-[40rem] md:mr-5 md:border md:mt-2 md:rounded-t-xl flex flex-col gap-16 md:gap-9 items-center relative'>
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
                        className='flex flex-col gap-10'
                    >
                        <div className='relative z-0'>
                            <input
                                type='text'
                                id='floating_standard'
                                className='block py-2.5 px-0 w-full text-sm text-slate-900 bg-transparent border-t-0 border-l-0 border-r-0 border-b-2 border-gray-300 appearance-none dark:text-slate-800 dark:font-semibold dark:tracking-wider dark:text-lg dark:border-gray-600 dark:focus:border-slate-600 focus:outline-none focus:ring-0 peer'
                                placeholder=' '
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                            />
                            <label
                                htmlFor='floating_standard'
                                className='absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:dark:text-slate-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'
                            >
                                Email
                            </label>
                        </div>

                        <div className='relative z-0 flex items-center'>
                            <input
                                type={`${showPassword ? "text" : "password"}`}
                                id='floating_standard'
                                className='block py-2.5 px-0 w-full text-sm text-slate-900 bg-transparent border-t-0 border-l-0 border-r-0 border-b-2 border-gray-300 appearance-none dark:text-slate-800 dark:font-semibold dark:tracking-wider dark:text-lg dark:border-gray-600 dark:focus:border-slate-600 focus:outline-none focus:ring-0 focus:border-blue-600 peer'
                                placeholder=' '
                                value={loginPassword}
                                onChange={(e) =>
                                    setLoginPassword(e.target.value)
                                }
                            />
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowPassword((prevState) => !prevState);
                                }}
                                className='absolute right-3 cursor-pointer bg-white'
                            >
                                {showPassword ? (
                                    <PiEyeBold className='text-xl' />
                                ) : (
                                    <PiEyeClosedBold className='text-xl' />
                                )}
                            </button>
                            <label
                                htmlFor='floating_standard'
                                className='absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-slate-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'
                            >
                                Password
                            </label>
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
            </article>
        </main>
    );
}
