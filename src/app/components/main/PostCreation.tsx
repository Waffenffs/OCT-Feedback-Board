"use client";

import { useState, useContext } from "react";
import { IoClose } from "react-icons/io5";
import { AuthContext } from "@/app/context/AuthProvider";
import { db } from "@/app/firebase/firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

type TPostCreationProps = {
    setPostCreationToggled: React.Dispatch<React.SetStateAction<boolean>>;
    setLatestCreatedFeedbackId: React.Dispatch<React.SetStateAction<string>>;
    setPostCreationSuccessful: React.Dispatch<React.SetStateAction<boolean>>;
};

type TFeedbackTag = "Academic" | "Faculty" | "Extracurricular" | "Technology";

export default function PostCreation({
    setPostCreationToggled,
    setLatestCreatedFeedbackId,
    setPostCreationSuccessful,
}: TPostCreationProps) {
    const [feedbackTitle, setFeedbackTitle] = useState("");
    const [feedbackReason, setFeedbackReason] = useState("");
    const [feedbackDescription, setFeedbackDescription] = useState("");
    const [feedbackTag, setFeedbackTag] = useState<TFeedbackTag>("Academic"); // Default
    const [creatorAnonymity, setCreatorAnonymity] = useState(false);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [showInvalidFieldsError, setShowInvalidFieldsError] = useState(false);

    const { ...profileProps } = useContext(AuthContext);
    const { profile } = profileProps;

    const feedbackTags: TFeedbackTag[] = [
        "Academic",
        "Faculty",
        "Extracurricular",
        "Technology",
    ];

    async function createPost() {
        if (!checkPostValidity()) {
            console.error(`Invalid fields!`);

            handleShowInvalidFieldsError();

            return;
        }

        const feedback = {
            creator: profile?.uid,
            creator_email: profile?.email,
            creator_anonymity: creatorAnonymity,
            creation_date: serverTimestamp(),
            title: feedbackTitle,
            reason: feedbackReason,
            description: feedbackDescription,
            tag: feedbackTag,
            upvotes: 0,
            post_comments: [],
            upvoters: [],
        };

        try {
            const feedbackRef = await addDoc(collection(db, "posts"), feedback);

            setAlreadySubmitted(true);
            setLatestCreatedFeedbackId(feedbackRef.id);
            setPostCreationSuccessful(true);
            setPostCreationToggled(false);
        } catch (error) {
            console.error(`Error with creating post: ${error}`);
        }
    }

    function checkPostValidity(): boolean {
        const fieldsToCheck = [
            feedbackTitle,
            feedbackReason,
            feedbackDescription,
        ];

        for (let field of fieldsToCheck) {
            if (!field || field.trim() === "" || field.split("").length <= 1) {
                return false;
            }
        }

        return true;
    }

    function handleShowInvalidFieldsError() {
        setShowInvalidFieldsError(true);

        const unsubscribe = setTimeout(() => {
            setShowInvalidFieldsError(false);
        }, 2000);

        () => clearTimeout(unsubscribe);
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='w-screen h-screen flex z-50 inset-0 justify-center items-center fixed bg-black/30'
        >
            <article className='w-full h-full md:w-[34rem] md:h-auto md:rounded md:px-10 md:pb-10 lg:w-[43rem] lg:h-[41rem] bg-white max-md:p-5 lg:py-3'>
                <header className='w-full flex justify-between items-center max-lg:my-3 lg:mb-4'>
                    <h1 className='text-2xl font-extrabold tracking-wider text-[#373e68]'>
                        Write a feedback
                    </h1>
                    <button onClick={() => setPostCreationToggled(false)}>
                        <IoClose className='text-3xl text-slate-500' />
                    </button>
                </header>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                    className='flex flex-col justify-start gap-5'
                >
                    <div className='flex flex-col gap-1'>
                        <h2 className='text-sm lg:text-xs font-bold tracking-wider text-slate-400'>
                            FEEDBACK TITLE
                        </h2>
                        <textarea
                            value={feedbackTitle}
                            onChange={(e) => setFeedbackTitle(e.target.value)}
                            maxLength={68}
                            rows={2}
                            className='border border-slate-300 text-lg text-slate-600 font-semibold w-full focus:outline-none resize-none px-3 py-1'
                        />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <h2 className='text-sm lg:text-xs font-bold tracking-wider text-slate-400'>
                            FEEDBACK REASON
                        </h2>
                        <textarea
                            value={feedbackReason}
                            onChange={(e) => setFeedbackReason(e.target.value)}
                            maxLength={80}
                            rows={3.5}
                            className='border border-slate-300 text-lg text-slate-600 font-semibold w-full focus:outline-none resize-none px-3 py-1'
                        />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <h2 className='text-sm lg:text-xs font-bold tracking-wider text-slate-400'>
                            FEEDBACK DESCRIPTION
                        </h2>
                        <textarea
                            value={feedbackDescription}
                            onChange={(e) =>
                                setFeedbackDescription(e.target.value)
                            }
                            rows={6}
                            className='border border-slate-300 text-lg text-slate-600 font-semibold w-full focus:outline-none resize-none px-3 py-1'
                        />
                    </div>

                    <footer className='flex flex-col gap-4'>
                        <ul className='flex flex-row gap-2 max-sm:flex-wrap mt-2 justify-around items-center'>
                            {feedbackTags.map((tag, index) => {
                                return (
                                    <li
                                        onClick={() => setFeedbackTag(tag)}
                                        className={`${
                                            tag !== feedbackTag
                                                ? "bg-[#f2f4ff]"
                                                : "bg-blue-200"
                                        } flex justify-center items-center w-32 cursor-pointer transition duration-200 rounded-xl py-2 px-3 font-semibold text-sm tracking-wide text-blue-500`}
                                        key={index}
                                    >
                                        {tag}
                                    </li>
                                );
                            })}
                        </ul>

                        <div className='w-full flex flex-row gap-2 items-center justify-start'>
                            <input
                                type='checkbox'
                                checked={creatorAnonymity}
                                onChange={() =>
                                    setCreatorAnonymity(
                                        (prevState) => !prevState
                                    )
                                }
                            />
                            <button
                                onClick={() =>
                                    setCreatorAnonymity(
                                        (prevState) => !prevState
                                    )
                                }
                            >
                                <span className='font-semibold tracking-wider text-sm text-slate-500'>
                                    Post with Anonymity
                                </span>
                            </button>
                        </div>

                        <section className='flex flex-row items-center justify-between gap-5 lg:-mt-4'>
                            <div className='animate-bounce'>
                                <AnimatePresence>
                                    {showInvalidFieldsError && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <span className='text-sm text-red-500 tracking-wider italic'>
                                                Invalid Fields!*
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className='flex flex-row items-center gap-4'>
                                <button
                                    onClick={() =>
                                        setPostCreationToggled(false)
                                    }
                                    className='w-24 border-2 rounded py-2'
                                >
                                    <span className='text-sm font-bold tracking-wider text-red-500'>
                                        Cancel
                                    </span>
                                </button>
                                <button
                                    onClick={() => {
                                        setAlreadySubmitted(true);

                                        const unsubscribe = setTimeout(() => {
                                            setAlreadySubmitted(false);
                                        }, 4000);

                                        clearTimeout(unsubscribe);

                                        createPost();
                                    }}
                                    disabled={alreadySubmitted}
                                    className={`w-24 border rounded py-2 ${
                                        alreadySubmitted
                                            ? "bg-gray-300"
                                            : "bg-blue-500"
                                    } transition`}
                                >
                                    <span className='text-sm font-bold tracking-wider text-white'>
                                        Post
                                    </span>
                                </button>
                            </div>
                        </section>
                    </footer>
                </form>
            </article>
        </motion.div>
    );
}
