"use client";

import { useState, useContext } from "react";
import { AnimatePresence } from "framer-motion";
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

            <div className='hidden md:flex w-full h-full justify-center items-center px-10'>
                <img src='/icon2.svg' alt='...icon' />
            </div>

            <article className='bg-white w-full h-full lg:w-[37rem] md:shadow-xl md:w-[40rem] md:mr-5 md:border md:mt-2 md:rounded-t-xl flex flex-col gap-16 md:gap-9 items-center relative'>
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
                        className='flex flex-col gap-10'
                    >
                        <div className='relative z-0'>
                            <input
                                type='text'
                                id='floating_standard'
                                className='block py-2.5 px-0 w-full text-sm text-slate-900 bg-transparent border-t-0 border-l-0 border-r-0 border-b-2 border-gray-300 appearance-none dark:text-slate-800 dark:font-semibold dark:tracking-wider dark:text-lg dark:border-gray-600 dark:focus:border-slate-600 focus:outline-none focus:ring-0 focus:border-blue-600 peer'
                                placeholder=' '
                                value={registerEmail}
                                onChange={(e) =>
                                    setRegisterEmail(e.target.value)
                                }
                            />
                            <label
                                htmlFor='floating_standard'
                                className='absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-slate-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'
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
                                value={registerPassword}
                                onChange={(e) =>
                                    setRegisterPassword(e.target.value)
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
            </article>
        </main>
    );
}
