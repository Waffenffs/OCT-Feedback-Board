"use client";

import { motion, AnimatePresence } from "framer-motion";
import { doc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/app/context/AuthProvider";
import { db, auth } from "@/app/firebase/firebaseConfig";
import { BiLogOutCircle } from "react-icons/bi";
import { getUserUID, getUserFeedbacks } from "@/app/utils/feedbackUtils";

import StatusModal from "../StatusModal";

export type TTags =
    | "All"
    | "Academic"
    | "Faculty"
    | "Extracurricular"
    | "Technology";

type TLeftSectionProps = {
    currentTag: TTags;
    setCurrentTag: React.Dispatch<React.SetStateAction<TTags>>;
};

export default function LeftSection({
    currentTag,
    setCurrentTag,
}: TLeftSectionProps) {
    const [currentFeedbackCount, setCurrentFeedbackCount] = useState<
        number | null
    >(null);
    const [currentUserIdentifier, setCurrentUserIdentifier] = useState<
        any | null
    >(null);
    const [editedUserIdentifier, setEditedUserIdentifier] = useState("");
    const [isEditingUserIdentifier, setIsEditingUserIdentifier] =
        useState(false);
    const [displayUIDStatusModal, setDisplayUIDStatusModal] = useState(false);

    const { ...profileProps } = useContext(AuthContext);
    const { profile } = profileProps;

    const tags: TTags[] = [
        "All",
        "Academic",
        "Faculty",
        "Extracurricular",
        "Technology",
    ];

    function handleTagClick(tag: TTags) {
        setCurrentTag(tag);
    }

    async function handleUserSignOut() {
        signOut(auth)
            .then(() => {
                console.log("Successfully signed out.");
            })
            .catch((error) => {
                throw new Error(`Error with signing out: ${error}`);
            });
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

    function displayStatusModal() {
        setDisplayUIDStatusModal(true);

        setTimeout(() => {
            setDisplayUIDStatusModal(false);
        }, 2000);
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

    useEffect(() => {
        if (!profile) return;

        const handleGetUserUID = async () => {
            const userUID = await getUserUID(profile.uid as string);

            setCurrentUserIdentifier(userUID);
        };

        const handleGetUserFeedbacks = async () => {
            const userFeedbacks = await getUserFeedbacks(profile.uid as string);

            setCurrentFeedbackCount(userFeedbacks.length);
        };

        handleGetUserUID();
        handleGetUserFeedbacks();
    }, []);

    const isSameUserIdentifier = editedUserIdentifier === currentUserIdentifier;

    return (
        <>
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

            <motion.div
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className='hidden md:flex md:px-10 lg:px-0 md:py-5 lg:py-0 md:flex-row lg:flex-col md:gap-6 lg:gap-3 lg:w-1/4'
            >
                <div className='max-lg:flex max-lg:justify-center max-lg:items-center  cursor-default bg-gradient-to-tr from-green-500 to-green-700 rounded-xl text-white pt-20 pb-4 px-7 max-lg:p-0 max-lg:px-5 shadow'>
                    <div className='max-lg:hidden'>
                        <h1 className='font-semibold tracking-wide text-xl'>
                            Olivarez College Tagaytay
                        </h1>
                        <h3 className='tracking-wide text-sm mt-1'>
                            Feedback Board
                        </h3>
                    </div>
                    <img
                        className='lg:hidden'
                        src='/oct-logo.png'
                        alt='...logo'
                    />
                </div>
                <div className='bg-white shadow rounded px-3 py-7'>
                    <h2 className='mb-5 font-bold tracking-wider text-[#373e68]'>
                        Tags
                    </h2>
                    <ul className='flex lg:flex-row md:flex-col flex-wrap gap-4'>
                        {tags.map((tag, index) => {
                            return (
                                <li
                                    onClick={() => handleTagClick(tag)}
                                    className={`cursor-pointer rounded ${
                                        tag !== currentTag
                                            ? "bg-[#f2f4ff]"
                                            : "bg-blue-500"
                                    } ${
                                        tag !== currentTag &&
                                        "hover:bg-gray-200"
                                    } transition py-1 px-3 tracking-wider font-semibold text-sm ${
                                        tag !== currentTag
                                            ? "text-blue-500"
                                            : "text-white"
                                    }`}
                                    key={index}
                                >
                                    {tag}
                                </li>
                            );
                        })}
                    </ul>
                </div>
                {currentUserIdentifier && (
                    <article className='mt-5 bg-white shadow border flex flex-col justify-start gap-1 p-5 text-sm'>
                        <input
                            value={`${
                                isEditingUserIdentifier
                                    ? editedUserIdentifier
                                    : currentUserIdentifier
                            }`}
                            onChange={(e) => {
                                setEditedUserIdentifier(e.target.value);
                            }}
                            onClick={() => setIsEditingUserIdentifier(true)}
                            className={`${
                                isEditingUserIdentifier &&
                                "bg-gray-400 text-white"
                            } font-semibold text-lg tracking-wider text-[#373e68] focus:outline-none cursor-pointer transition duration-150 hover:bg-gray-400 hover:text-white px-2 rounded`}
                        />
                        {isEditingUserIdentifier && (
                            <div className='w-full flex justify-between items-center text-white font-semibold tracking-wider text-xs'>
                                <button
                                    onClick={() => {
                                        setIsEditingUserIdentifier(false);
                                        setEditedUserIdentifier(
                                            currentUserIdentifier
                                        );
                                    }}
                                    className='rounded bg-red-500 py-1 px-3 transition hover:bg-red-600'
                                >
                                    <span>Discard</span>
                                </button>
                                <button
                                    onClick={() => updateUserIdentifier()}
                                    disabled={isSameUserIdentifier}
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
                        <h4 className='text-sm font-semibold tracking-wider text-slate-500 px-2'>
                            {profile?.email}
                        </h4>
                        <footer className='px-2 mt-10 flex flex-col justify-center items-center w-full'>
                            <h1 className='text-2xl font-extrabold tracking-wider text-[#373e68]'>
                                Feedbacks
                            </h1>
                            <h2 className='text-center self-center font-extrabold text-4xl tracking-wider text-blue-500'>
                                {currentFeedbackCount}
                            </h2>
                        </footer>
                        <button
                            onClick={() => handleUserSignOut()}
                            className='mt-10 tracking-wider flex flex-row items-center gap-2 text-slate-400'
                        >
                            <BiLogOutCircle className='text-xl' />
                            <h2 className='font-bold'>SIGN OUT</h2>
                        </button>
                    </article>
                )}
                <footer className='max-lg:hidden w-full flex justify-center items-center mt-4'>
                    <span className='text-slate-500  tracking-wide text-xs'>
                        Developed by{" "}
                        <a
                            href='https://facebook.com/waffenSA'
                            target='_blank'
                            className='text-blue-500 hover:underline cursor-pointer'
                        >
                            @Waffen_Ampatua
                        </a>
                    </span>
                </footer>
            </motion.div>

            <footer className='max-sm:hidden lg:hidden w-full flex justify-end items-center px-10 -my-6'>
                <span className='text-slate-500  tracking-wide text-xs'>
                    Developed by{" "}
                    <a
                        href='https://facebook.com/waffenSA'
                        target='_blank'
                        className='text-blue-500 hover:underline cursor-pointer'
                    >
                        @Waffen_Ampatua
                    </a>
                </span>
            </footer>
        </>
    );
}
