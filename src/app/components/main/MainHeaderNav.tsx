"use client";

import { auth } from "@/app/firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import {
    doc,
    getDoc,
    collection,
    onSnapshot,
    query,
    where,
    updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FeedbackContext } from "@/app/context/FeedbackProvider";
import { HiOutlineLightBulb } from "react-icons/hi";
import { HiBars3 } from "react-icons/hi2";
import { BiLogOutCircle } from "react-icons/bi";
import { AuthContext } from "@/app/context/AuthProvider";
import { db } from "@/app/firebase/firebaseConfig";

import StatusModal from "../StatusModal";

type TMainHeaderNav = {
    setPostCreationToggled: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function MainHeaderNav({
    setPostCreationToggled,
}: TMainHeaderNav) {
    const contextValue = useContext(FeedbackContext);
    const { feedbackAmount } = contextValue || {};
    const { ...profileProps } = useContext(AuthContext);
    const { profile } = profileProps;
    const router = useRouter();

    const [isNavOpened, setIsNavOpened] = useState(false);
    const [currentUserIdentifier, setCurrentUserIdentifier] = useState<
        undefined | string
    >(undefined);
    const [isEditingUserIdentifier, setIsEditingUserIdentifier] =
        useState(false);
    const [displayUIDStatusModal, setDisplayUIDStatusModal] = useState(false);
    const [editedUserIdentifier, setEditedUserIdentifier] = useState("");
    const [userFeedbacksAmount, setUserFeedbacksAmount] = useState<
        undefined | number
    >(undefined);

    async function handleSignOut() {
        signOut(auth)
            .then(() => {
                console.log("Sign out successful.");

                return router.push("/");
            })
            .catch((error) => {
                console.log(`Error with signing out: ${error}`);
            });
    }

    async function getUserProfile() {
        const docRef = doc(db, "users", profile?.uid as string);
        const user = await getDoc(docRef);

        if (!user.exists()) throw new Error("User does not exist!");

        setCurrentUserIdentifier(user.data()?.user_identifier);
    }

    async function getUserFeedbacks() {
        const postsRef = collection(db, "posts");

        let q = query(postsRef, where("creator", "==", profile?.uid as string));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const userFeedbacks: any[] = [];

            querySnapshot.forEach((doc) => userFeedbacks.push(doc.data()));

            setUserFeedbacksAmount(userFeedbacks.length);
        });

        return () => unsubscribe();
    }

    async function updateUserIdentifier() {
        try {
            checkUserIdentifierValidity();

            const userRef = doc(db, "users", profile?.uid as string);

            await updateDoc(userRef, {
                user_identifier: editedUserIdentifier,
            });

            displayStatusModal();

            setCurrentUserIdentifier(editedUserIdentifier);
            setIsEditingUserIdentifier(false);
        } catch (error) {
            console.error(error);
        }
    }

    function checkUserIdentifierValidity() {
        const invalidCharacters = '!@#$%^&*()-_=+`~[]{}:;".><?/';

        if (
            !editedUserIdentifier ||
            editedUserIdentifier.trim().length < 5 ||
            editedUserIdentifier.toLowerCase() === "anonymous"
        ) {
            throw new Error(
                `Invalid new User Identifier! ${editedUserIdentifier}`
            );
        }

        for (let i of editedUserIdentifier) {
            if (invalidCharacters.includes(i)) {
                throw new Error("Invalid new User Identifier!");
            }
        }
    }

    function displayStatusModal() {
        setDisplayUIDStatusModal(true);

        setTimeout(() => {
            setDisplayUIDStatusModal(false);
        }, 2000);
    }

    useEffect(() => {
        if (!profile) return;

        try {
            getUserProfile();
            getUserFeedbacks();
        } catch (error) {
            console.error(error);
        }
    }, []);

    const isSameUserIdentifier = editedUserIdentifier === currentUserIdentifier;

    return (
        <div className='relative'>
            <AnimatePresence>
                {displayUIDStatusModal && (
                    <StatusModal
                        type={"user_database_write"}
                        isSuccess={true}
                        message='Successfully changed your username!'
                        setShowModal={setDisplayUIDStatusModal}
                    />
                )}
            </AnimatePresence>

            <nav className='fixed top-0 w-full md:hidden flex flex-col transition z-50'>
                <motion.header
                    initial={{ opacity: 1, y: -1000 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5 }}
                    className='flex z-50 transition shadow flex-row justify-between items-center bg-gradient-to-tr from-emerald-500 to-lime-600 py-5 px-8'
                >
                    <section>
                        <h1 className='text-white font-semibold tracking-wider text-lg'>
                            OCT Feedback Board
                        </h1>
                    </section>
                    <button
                        onClick={() =>
                            setIsNavOpened((prevState) => !prevState)
                        }
                        className={`transition transform duration-500 ${
                            isNavOpened ? "rotate-90" : ""
                        }`}
                    >
                        <HiBars3 className='text-2xl text-white' />
                    </button>
                </motion.header>

                <AnimatePresence>
                    {isNavOpened && (
                        <motion.div
                            initial={{ opacity: 0, y: -1000 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 1, y: -1000 }}
                            transition={{
                                ease: "easeOut",
                            }}
                            className='w-full transition-all absolute top-16 z-40'
                        >
                            <div className='shadow-xl bg-white w-full flex flex-col border rounded-b-xl -mt-3 z-20 pt-7 px-3 pb-4'>
                                <header>
                                    <div className='w-64'>
                                        <input
                                            value={`${
                                                isEditingUserIdentifier
                                                    ? editedUserIdentifier
                                                    : currentUserIdentifier
                                            }`}
                                            onChange={(e) => {
                                                setEditedUserIdentifier(
                                                    e.target.value
                                                );
                                            }}
                                            onClick={() =>
                                                setIsEditingUserIdentifier(true)
                                            }
                                            className={`${
                                                isEditingUserIdentifier &&
                                                "bg-gray-400 text-white"
                                            } font-semibold w-full text-lg tracking-wider text-[#373e68] focus:outline-none cursor-pointer transition duration-150 hover:bg-gray-400 hover:text-white ${
                                                isEditingUserIdentifier
                                                    ? "px-2 "
                                                    : ""
                                            } rounded`}
                                        />
                                        {isEditingUserIdentifier && (
                                            <div className='w-full my-1 flex justify-between items-center text-white font-semibold tracking-wider text-xs'>
                                                <button
                                                    onClick={() => {
                                                        setIsEditingUserIdentifier(
                                                            false
                                                        );
                                                        setEditedUserIdentifier(
                                                            currentUserIdentifier as string
                                                        );
                                                    }}
                                                    className='rounded bg-red-500 py-1 px-3 transition hover:bg-red-600'
                                                >
                                                    <span>Discard</span>
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        updateUserIdentifier()
                                                    }
                                                    disabled={
                                                        isSameUserIdentifier
                                                    }
                                                    className={`rounded ${
                                                        isSameUserIdentifier
                                                            ? "bg-gray-500"
                                                            : "bg-blue-500"
                                                    } py-1 px-3 transition `}
                                                >
                                                    <span>Edit</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <h2 className='text-sm font-semibold tracking-wider text-slate-500 '>
                                        {profile?.email}
                                    </h2>
                                </header>
                                <footer className='px-2 mt-7 flex flex-col justify-center items-center w-full'>
                                    <h1 className='text-2xl font-extrabold tracking-wider text-[#373e68]'>
                                        Feedbacks
                                    </h1>
                                    <h2 className='text-center self-center font-extrabold text-4xl tracking-wider text-blue-500'>
                                        {userFeedbacksAmount}
                                    </h2>
                                </footer>

                                <button
                                    onClick={() => handleSignOut()}
                                    className='mt-10 tracking-wider flex flex-row items-center gap-2 text-slate-400 self-end'
                                >
                                    <BiLogOutCircle className='text-xl' />
                                    <h2 className='font-bold'>SIGN OUT</h2>
                                </button>

                                <footer className='w-full flex justify-center items-center mt-10'>
                                    <span className='text-slate-500  tracking-wide text-xs'>
                                        Developed by{" "}
                                        <a
                                            href='facebook.com/waffenSA'
                                            target='_blank`'
                                            className='text-blue-500 hover:underline cursor-pointer'
                                        >
                                            @Waffen_Ampatua
                                        </a>
                                    </span>
                                </footer>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
                className='z-30 max-sm:rounded-full max-sm:mx-3 max-sm:mt-20 md:rounded-xl md:mx-10 lg:px-10 flex flex-row items-center px-4 py-3 bg-[#373e68] text-white text-sm tracking-wider whitespace-nowrap'
            >
                <div className='z-30 flex flex-row items-center gap-1 relative w-48'>
                    <div className='z-30 flex flex-row items-center gap-2 font-bold tracking-wider text-lg md:text-xl mr-10'>
                        <HiOutlineLightBulb className='text-3xl z-40' />
                        <span className='z-30'>
                            {" "}
                            {feedbackAmount !== undefined &&
                                feedbackAmount.toString()}
                        </span>
                        <span className='z-30'>Suggestions</span>
                    </div>
                </div>
                <button
                    onClick={() => setPostCreationToggled(true)}
                    className='z-30 ml-auto bg-[#ae1feb] rounded-full py-3 px-3'
                >
                    <span className='z-30 font-bold tracking-wider'>
                        + Add Feedback
                    </span>
                </button>
            </motion.div>
        </div>
    );
}
