"use client";

import { useState, useContext } from "react";
import { AiOutlineArrowRight } from "react-icons/ai";
import { AuthContext } from "@/app/context/AuthProvider";
import { db } from "@/app/firebase/firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { motion } from "framer-motion";

type TPostCreationProps = {
    setPostCreationToggled: React.Dispatch<React.SetStateAction<boolean>>;
    setLatestCreatedFeedbackId: React.Dispatch<React.SetStateAction<string>>;
    setPostCreationSuccessful: React.Dispatch<React.SetStateAction<boolean>>;
};

type TFeedbackTag = "Academic" | "Faculty" | "Extracurricular" | "Technology";

export function PostCreation({
    setPostCreationToggled,
    setLatestCreatedFeedbackId,
    setPostCreationSuccessful,
}: TPostCreationProps) {
    const [feedbackTitle, setFeedbackTitle] = useState("");
    const [feedbackReason, setFeedbackReason] = useState("");
    const [feedbackDescription, setFeedbackDescription] = useState("");
    const [feedbackTag, setFeedbackTag] = useState<TFeedbackTag>("Academic"); // default

    const { ...profileProps } = useContext(AuthContext);
    const { profile } = profileProps;

    const feedbackTags: TFeedbackTag[] = [
        "Academic",
        "Faculty",
        "Extracurricular",
        "Technology",
    ];

    async function createPost(
        post_title: string,
        post_reason: string,
        post_description: string,
        post_tag: TFeedbackTag
    ) {
        if (!checkPostValidity()) {
            console.error(`Invalid fields!`);
            return; // don't do anything.
        }

        const feedback = {
            creator: profile?.uid,
            creator_email: profile?.email,
            creation_date: serverTimestamp(),
            title: post_title,
            reason: post_reason,
            description: post_description,
            tag: post_tag,
            upvotes: 0, // initially zero because it is a newly created post
            post_comments: [], // 0 length because it is a newly created post
            upvoters: [], // initilaly zero because it is a newly created post
        };

        try {
            const feedbackRef = await addDoc(collection(db, "posts"), feedback);

            console.log(
                `Successfully created post with the id: ${feedbackRef.id}`
            );

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

    return (
        <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='w-screen h-screen flex z-50 inset-0 justify-center items-center fixed bg-black/30'
        >
            <form
                className='shadow-xl rounded flex flex-col md:flex-row w-[22rem] md:w-4/5 bg-[#f7f8fd]'
                onSubmit={(e) => e.preventDefault()}
            >
                <div className='md:w-4/5'>
                    <header className='rounded-t py-5 px-4 border-b-2 bg-white'>
                        <h1 className='text-2xl tracking-wide text-slate-900'>
                            Add New Feedback
                        </h1>
                    </header>
                    <section className='flex flex-col w-full px-4 mt-4'>
                        <h3 className='font-semibold tracking-wide text-slate-600'>
                            Feedback Title
                        </h3>
                        <textarea
                            placeholder='Your title here...'
                            value={feedbackTitle}
                            onChange={(e) => setFeedbackTitle(e.target.value)}
                            className='mt-3 bg-white border rounded p-2 focus:outline-slate-400 resize-none'
                            maxLength={35}
                            rows={1}
                            cols={1}
                        />
                    </section>
                    <section className='flex flex-col w-full px-4 mt-4'>
                        <h3 className='font-semibold tracking-wide text-slate-600'>
                            Feedback Reason
                        </h3>
                        <textarea
                            placeholder='Your reasoning here...'
                            value={feedbackReason}
                            onChange={(e) => setFeedbackReason(e.target.value)}
                            className='mt-3 bg-white border rounded p-2 focus:outline-slate-400 resize-none'
                            rows={2}
                            maxLength={60}
                        />
                    </section>
                    <section className='flex flex-col w-full px-4 mt-4 md:mb-10'>
                        <h3 className='font-semibold tracking-wide text-slate-600'>
                            Feedback Description
                        </h3>
                        <textarea
                            placeholder='Your description here...'
                            value={feedbackDescription}
                            onChange={(e) =>
                                setFeedbackDescription(e.target.value)
                            }
                            className='mt-3 bg-white border rounded p-2 focus:outline-slate-400 resize-none'
                            rows={5}
                            cols={1}
                        />
                    </section>
                </div>
                <footer className='w-full bg-white mt-4 md:mt-0 md:flex flex-col justify-between md:border-l-2 md:border-t-0 lg:w-1/5 md:w-2/5 md:rounded-t px-4 py-2 border-t-2 rounded-b'>
                    <ul className='flex flex-row gap-2 flex-wrap mt-2 justify-around items-center'>
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

                    <div className='flex flex-row md:flex-col md:gap-4 items-center justify-between w-full py-5'>
                        <button
                            className='px-2'
                            onClick={() => setPostCreationToggled(false)}
                        >
                            <h2 className='tracking-wide text-lg text-red-500 font-semibold'>
                                Discard
                            </h2>
                        </button>

                        <button
                            onClick={() =>
                                createPost(
                                    feedbackTitle,
                                    feedbackReason,
                                    feedbackDescription,
                                    feedbackTag
                                )
                            }
                            className='flex flex-row items-center gap-1 bg-gray-700 border-2 transition lg:bg-white lg:border-gray-700 group hover:bg-gray-700 rounded-2xl py-2 px-5'
                        >
                            <h2 className='text-lg text-white lg:text-slate-700 group-hover:text-white tracking-wide font-semibold'>
                                Post
                            </h2>
                            <AiOutlineArrowRight className='text-white lg:text-slate-700 group-hover:text-white' />
                        </button>
                    </div>
                </footer>
            </form>
        </motion.div>
    );
}
