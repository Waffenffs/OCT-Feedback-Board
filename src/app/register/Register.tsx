"use client";

import { useState, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { auth, db } from "../firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { AuthContext } from "../context/AuthProvider";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { PiEyeClosedBold, PiEyeBold } from "react-icons/pi";

import Link from "next/link";
import StatusModal from "../components/StatusModal";

export default function Register() {
    const router = useRouter();
    const { ...profileProps } = useContext(AuthContext);
    const { setProfile } = profileProps;

    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [statusModalProps, setStatusModalProps] = useState<any>({
        type: undefined,
        isSuccess: undefined,
        message: undefined,
    });

    async function initializeUserInstance(email: string, uid: any) {
        try {
            await setDoc(doc(db, "users", uid), {
                email: email,
                user_identifier: `User ${uid}`,
            });
        } catch (error) {
            throw new Error(`Error: ${error}`);
        }
    }

    function registerUser(email: string, password: string) {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                setProfile({
                    authenticated: true,
                    email: userCredential.user.email,
                    uid: userCredential.user.uid,
                });

                initializeUserInstance(email, userCredential.user.uid);

                setStatusModalProps({
                    type: "user_authentication",
                    isSuccess: true,
                    message:
                        "Successfully registered! We are pleased to have you as a member..",
                });

                setShowModal(true);

                setTimeout(() => {
                    setShowModal(false);
                }, 5000);

                setTimeout(() => {
                    return router.push("/");
                }, 6000);
            })
            .catch((error) => {
                setProfile({
                    authenticated: false,
                    email: "undefined",
                    uid: "undefined",
                });

                setStatusModalProps({
                    type: "user_authentication",
                    isSuccess: false,
                    message: "Failed registering! You may shortly try again.",
                });

                setShowModal(true);

                setTimeout(() => {
                    setShowModal(false);
                }, 5000);

                console.error(`Error with authentication: ${error}`);
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

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className='hidden md:flex w-full h-full justify-center items-center px-10'
            >
                <img src='/icon2.svg' alt='...icon' />
            </motion.div>

            <motion.article
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className='bg-white w-full h-full lg:w-[37rem] md:shadow-xl md:w-[40rem] md:mr-5 md:border md:mt-2 md:rounded-t-xl flex flex-col gap-16 md:gap-9 items-center relative'
            >
                <div className='w-28 h-28 mt-14 md:w-24 md:h-24 md:mt-8'>
                    <img
                        src='/oct-logo.png'
                        alt='...icon'
                        className='object-cover'
                    />
                </div>

                <header className='text-center'>
                    <h1 className='font-extrabold tracking-wider text-3xl md:text-2xl mb-3 text-slate-800'>
                        We&apos;re pleased to have you!
                    </h1>
                    <h3 className='font-semibold text-sm tracking-wide text-slate-500'>
                        Please enter your details
                    </h3>
                </header>

                <div className='w-80 md:w-64 lg:w-72 flex flex-col gap-10'>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            registerUser(registerEmail, registerPassword);
                        }}
                        className='flex flex-col'
                    >
                        <div className='w-full flex flex-col gap-1 justify-start mb-3'>
                            <h1 className='font-bold text-gray-700 tracking-wide'>
                                Email
                            </h1>
                            <input
                                type='text'
                                placeholder='Email'
                                value={registerEmail}
                                onChange={(e) =>
                                    setRegisterEmail(e.target.value)
                                }
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
                                    value={registerPassword}
                                    onChange={(e) =>
                                        setRegisterPassword(e.target.value)
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
                                    className='absolute right-0 cursor-pointer bg-white h-full border-t border-r border-b pr-1'
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
                                    registerUser(registerEmail, registerEmail)
                                }
                                className='w-full focus:outline-none rounded-2xl bg-green-600 text-white py-2 text-xl font-semibold shadow'
                            >
                                <h2>Sign Up</h2>
                            </button>
                        </footer>
                    </form>

                    <h4 className='text-sm font-semibold text-slate-500 text-center tracking-wider'>
                        Already have an account?{" "}
                        <Link
                            href='/'
                            className='font-extrabold text-blue-400 tracking-wider'
                        >
                            Log In
                        </Link>
                    </h4>
                </div>
            </motion.article>
        </main>
    );
}
