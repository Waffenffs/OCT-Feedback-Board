"use client";

import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { useState } from "react";
import { db } from "@/app/firebase/firebaseConfig";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

type TEditFeedbackProps = {
    previous_title: string;
    previous_reason: string;
    previous_description: string;
    previous_tag: TFeedbackTag;
    toggleEditing: React.Dispatch<React.SetStateAction<boolean>>;
    feedback_uid: string;
};

type TFeedbackTag = "Academic" | "Faculty" | "Extracurricular" | "Technology";

export default function EditFeedbackModal({
    previous_title,
    previous_reason,
    previous_description,
    previous_tag,
    toggleEditing,
    feedback_uid,
}: TEditFeedbackProps) {
    const [editedTitle, setEditedTitle] = useState(previous_title);
    const [editedReason, setEditedReason] = useState(previous_reason);
    const [editedDescription, setEditedDescription] =
        useState(previous_description);
    const [editedTag, setEditedTag] = useState<TFeedbackTag>(previous_tag);
    const [showInvalidFieldsError, setShowInvalidFieldsError] = useState(false);

    const feedbackTags: TFeedbackTag[] = [
        "Academic",
        "Faculty",
        "Extracurricular",
        "Technology",
    ];

    const noChangesMade =
        editedTitle === previous_title &&
        editedReason === previous_reason &&
        editedDescription === previous_description &&
        editedTag === previous_tag;

    async function editFeedback() {
        const feedbackRef = doc(db, "posts", feedback_uid);

        await updateDoc(feedbackRef, {
            title: editedTitle,
            tag: editedTag,
            reason: editedReason,
            description: editedDescription,
            last_edited: serverTimestamp(),
        });
    }

    async function handleEditFeedback() {
        try {
            checkEditValidity();
            editFeedback();

            toggleEditing(false);
        } catch (error) {
            console.error(error);

            handleShowInvalidFieldsError();
        }
    }

    function handleShowInvalidFieldsError() {
        setShowInvalidFieldsError(true);

        const unsubscribe = setTimeout(() => {
            setShowInvalidFieldsError(false);
        }, 2000);

        () => clearTimeout(unsubscribe);
    }

    function checkEditValidity() {
        const invalidCharacters = "~!@#$%^&*()_+-=;:[{]}".split("");
        const minimumLength = 5;

        for (let i of editedTitle) {
            if (invalidCharacters.includes(i))
                throw new Error("Invalid Fields!");
        }

        if (
            editedTitle.trim() === "" ||
            editedReason.trim() === "" ||
            editedDescription.trim() === "" ||
            editedTitle.trim().length <= minimumLength ||
            editedReason.trim().length <= minimumLength ||
            editedDescription.trim().length <= minimumLength
        )
            throw new Error("Invalid fields!");
    }

    return (
        <motion.article
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='w-screen h-screen flex z-50 inset-0 justify-center items-center fixed bg-black/30'
        >
            <article className='w-full h-full bg-white md:w-[34rem] md:py-10 md:h-auto md:rounded md:px-10 md:pb-10 lg:w-[43rem] lg:h-[41rem] bg-white max-md:p-5 lg:py-3'>
                <header className='w-full flex justify-between items-center max-lg:my-3 lg:mb-4'>
                    <h1 className='text-2xl font-extrabold tracking-wider text-[#373e68]'>
                        Edit feedback
                    </h1>
                    <button onClick={() => toggleEditing(false)}>
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
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
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
                            value={editedReason}
                            onChange={(e) => setEditedReason(e.target.value)}
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
                            value={editedDescription}
                            onChange={(e) =>
                                setEditedDescription(e.target.value)
                            }
                            rows={6}
                            className='border border-slate-300 text-lg text-slate-600 font-semibold w-full focus:outline-none resize-none px-3 py-1'
                        />
                    </div>

                    <footer className='flex flex-col gap-4 lg:gap-10'>
                        <ul className='flex flex-row gap-2 max-sm:flex-wrap mt-2 justify-around items-center'>
                            {feedbackTags.map((tag, index) => {
                                return (
                                    <li
                                        onClick={() => setEditedTag(tag)}
                                        className={`${
                                            tag !== editedTag
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

                        <section className='flex flex-row items-center justify-between lg:-mt-4'>
                            <div className='animate-bounce'>
                                <AnimatePresence>
                                    {showInvalidFieldsError && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <span className='text-sm  text-red-500 tracking-wider italic'>
                                                Invalid Fields!*
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className='flex flex-row items-center gap-4'>
                                <button
                                    onClick={() => toggleEditing(false)}
                                    className='w-24 border-2 rounded py-2'
                                >
                                    <span className='text-sm font-bold tracking-wider text-red-500'>
                                        Discard
                                    </span>
                                </button>
                                <button
                                    onClick={() => handleEditFeedback()}
                                    className={`w-24 border rounded py-2 ${
                                        noChangesMade
                                            ? "bg-gray-300"
                                            : "bg-blue-500"
                                    }`}
                                    disabled={noChangesMade}
                                >
                                    <span className='text-sm font-bold tracking-wider text-white'>
                                        Edit
                                    </span>
                                </button>
                            </div>
                        </section>
                    </footer>
                </form>
            </article>
        </motion.article>
    );
}
