"use client";

import { useState, useEffect, useContext } from "react";
import { db } from "@/app/firebase/firebaseConfig";
import { AuthContext } from "@/app/context/AuthProvider";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { BsFillChatFill } from "react-icons/bs";
import { LiaEditSolid } from "react-icons/lia";
import {
    BiSolidChevronLeft,
    BiSolidChevronUp,
    BiTime,
    BiUser,
    BiEditAlt,
} from "react-icons/bi";

import Loading from "@/app/components/Loading";
import FallbackContent from "@/app/components/FallbackContent";
import EditFeedbackModal from "@/app/components/feedback/EditFeedbackModal";
import CommentInput, { IComment } from "@/app/components/feedback/CommentInput";
import Comment from "@/app/components/feedback/Comment";
import DropdownModal from "@/app/components/ui/DropdownModal";

export type TOptions = "New" | "Top" | "Controversial";

export function formatTimestamp(timestamp: any) {
    if (!timestamp) return null;

    const INTLFormat: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    };

    const timestampToDate = new Date(timestamp.seconds * 1000);

    return new Intl.DateTimeFormat("en-us", INTLFormat).format(timestampToDate);
}

export default function FeedbackContent() {
    const feedbackId = useSearchParams().get("id")?.split("/")[0];
    const router = useRouter();
    const { ...profileProps } = useContext(AuthContext);
    const { profile } = profileProps;

    const [isLoading, setIsLoading] = useState(true);
    const [authorUserIdentifier, setAuthorUserIdentifier] = useState<
        string | undefined
    >(undefined);
    const [isOwner, setIsOwner] = useState(false);
    const [isEditingFeedback, setIsEditingFeedback] = useState(false);
    const [feedback, setFeedback] = useState<any>();
    const [sortedFeedbackComments, setSortedFeedbackComments] = useState<any>();
    const [convertedFeedbackDate, setConvertedFeedbackDate] = useState("");
    const [convertedEditDate, setConvertedEditDate] = useState("");
    const [currentCommentSort, setCurrentCommentSort] =
        useState<TOptions>("Top");
    const [documentDoesNotExist, setDocumentDoesNotExist] = useState<
        boolean | undefined
    >(undefined);

    async function fetchDataFromFirebase() {
        if (!feedbackId) return;

        const docRef = doc(db, "posts", feedbackId as string);

        try {
            const unsubscribe = onSnapshot(docRef, (doc) => {
                if (!doc.exists())
                    throw new Error(
                        "Error with fetching slug data. Document may not exist."
                    );

                setFeedback(doc.data());
                setIsLoading(false);
            });

            return () => unsubscribe();
        } catch (error) {
            console.log(error);

            setIsLoading(false);
            setDocumentDoesNotExist(true);
        }
    }

    async function getAuthorUserIdentifier(uid: string) {
        try {
            const authorUserIdentifier = doc(db, "users", uid);
            const authorSnap = await getDoc(authorUserIdentifier);

            if (!authorSnap.exists()) throw new Error("Author does not exist!");

            const author = authorSnap.data();

            setAuthorUserIdentifier(author.user_identifier);
        } catch (error) {
            console.error(error);
        }
    }

    async function upvoteFeedback() {
        try {
            const docRef = doc(db, "posts", feedbackId as string);
            const feedbackSnap = await getDoc(docRef);

            if (!feedbackSnap || !feedbackSnap.exists()) {
                throw new Error(
                    "Error, feedback reference does not seem to be caught."
                );
            }

            if (feedbackSnap.data().upvoters.includes(profile?.email)) {
                const filteredUpvoters = feedbackSnap
                    .data()
                    .upvoters.filter(
                        (upvoter: any) => upvoter !== profile?.email
                    );

                await updateDoc(docRef, {
                    upvotes: feedbackSnap.data().upvotes - 1,
                    upvoters: filteredUpvoters,
                });

                fetchDataFromFirebase();
            } else {
                const updatedVoters = feedbackSnap.data().upvoters;
                updatedVoters.push(profile?.email);

                await updateDoc(docRef, {
                    upvotes: feedbackSnap.data().upvotes + 1,
                    upvoters: updatedVoters,
                });

                fetchDataFromFirebase();
            }
        } catch (error) {
            console.error(`Error with upvoting feedback: ${error}`);
        }
    }

    function handleRedirectBack() {
        if (!profile?.authenticated) {
            return router.push("/");
        }

        router.push("/main");
    }

    function checkURLTitle() {
        const formattedTitle = feedback.title
            .split(" ")
            .join("_")
            .toLowerCase();
        const currentURL = new URL(window.location.href);

        if (
            currentURL.pathname !==
            `/feedback/redirect?id=${feedbackId}/${formattedTitle}`
        ) {
            const newURL = `/feedback/redirect?id=${feedbackId}/${formattedTitle}`;

            router.replace(newURL);
        }
    }

    useEffect(() => {
        fetchDataFromFirebase();
    }, []);

    useEffect(() => {
        if (!feedback || !feedbackId) return;

        checkURLTitle();
    }, [feedback, feedbackId]);

    useEffect(() => {
        if (isLoading) return; // wait for it to load

        if (feedback.creator_email === profile?.email) {
            setIsOwner(true);
        }

        getAuthorUserIdentifier(feedback.creator);

        const creationTimestamp = feedback.creation_date;
        const formattedCreationTimestamp = formatTimestamp(creationTimestamp);

        setConvertedFeedbackDate(formattedCreationTimestamp as string);

        const lastEditedTimestamp = feedback.last_edited;
        const formattedLastEditedTimestamp =
            formatTimestamp(lastEditedTimestamp);

        setConvertedEditDate(formattedLastEditedTimestamp as string);
    }, [feedback]);

    useEffect(() => {
        let comments = feedback?.post_comments;

        if (comments) {
            if (currentCommentSort === "Top") {
                comments.sort(
                    (a: any, b: any) => b.comment_upvotes - a.comment_upvotes
                );
            } else if (currentCommentSort === "Controversial") {
                comments.sort(
                    (a: any, b: any) => a.comment_upvotes - b.comment_upvotes
                );
            }

            setSortedFeedbackComments(comments);
        }
    }, [currentCommentSort, feedback]);

    if (isLoading) {
        return <Loading />;
    }

    if (documentDoesNotExist) {
        return <FallbackContent />;
    }

    // TO-DO:
    // 1. Fix sorting.

    return (
        <main className='w-screen h-screen bg-[#f7f8fd] py-7 overflow-y-auto relative'>
            <AnimatePresence>
                {isEditingFeedback && (
                    <EditFeedbackModal
                        previous_title={feedback.title}
                        previous_reason={feedback.reason}
                        previous_description={feedback.description}
                        previous_tag={feedback.tag}
                        toggleEditing={setIsEditingFeedback}
                        feedback_uid={feedbackId as string}
                    />
                )}
            </AnimatePresence>
            <header className='flex flex-col gap-3 w-full px-5 lg:px-24'>
                <motion.div
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className='w-full flex items-center justify-between'
                >
                    <button
                        onClick={() => handleRedirectBack()}
                        className='flex flex-row items-center gap-1'
                    >
                        <BiSolidChevronLeft className='text-2xl text-blue-500' />
                        <h2 className='font-semibold tracking-wider text-[#373e68]'>
                            {profile?.authenticated ? "Main" : "Log In"}
                        </h2>
                    </button>
                    {isOwner && (
                        <button
                            onClick={() => setIsEditingFeedback(true)}
                            className='flex flex-row gap-1 items-center font-semibold tracking-wider text-sm py-4 px-5 text-white bg-[#4661e6] rounded-xl'
                        >
                            <LiaEditSolid className='text-xl' />
                            <span>Edit Feedback</span>
                        </button>
                    )}
                </motion.div>

                <motion.article
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 }}
                    className='mt-5 feedback-card bg-white rounded md:rounded-xl py-6 px-5 w-full md:border transition duration-150'
                >
                    <div className='flex flex-row gap-5'>
                        <div className='md:block'>
                            <button
                                onClick={() => upvoteFeedback()}
                                className='hidden hover:border-slate-500 border z-10 bg-[#f2f4ff] gap-1 md:flex flex-col justify-center items-center w-16 cursor-pointer transition duration-200 rounded-xl py-2 px-3 font-semibold text-sm tracking-wider'
                            >
                                <BiSolidChevronUp className='text-2xl text-blue-500' />
                                <h3 className='font-bold tracking-wider text-[#373e68]'>
                                    {feedback.upvotes}
                                </h3>
                            </button>
                        </div>
                        <div className='min-sm:hidden md:flex flex-row w-full justify-between'>
                            <div className='flex flex-col gap-4 w-full'>
                                <h1 className='font-extrabold tracking-wider text-[#373e68] text-xl'>
                                    {feedback.title}
                                </h1>
                                <div className='flex max-sm:flex-col md:items-center md:justify-between w-full -mt-2'>
                                    <h2 className='flex flex-row items-center gap-1 font-semibold tracking-wider text-slate-600 text-sm'>
                                        <BiUser className='text-xl' />
                                        {feedback?.creator_anonymity
                                            ? "Anonymous"
                                            : authorUserIdentifier}
                                    </h2>

                                    <span className='flex flex-row gap-1 max-sm:mt-2 max-sm:text-xs md:items-center font-semibold tracking-wide text-sm text-slate-600'>
                                        <BiTime /> Posted{" "}
                                        {convertedFeedbackDate}
                                    </span>
                                </div>
                                <p className='text-[#373e68] tracking-wide mt-7'>
                                    {feedback.reason}
                                </p>
                                <div className='p-2 mr-4 rounded bg-[#fefce8]'>
                                    <p className='text-lg tracking-wide text-[#373e68] whitespace-pre-wrap'>
                                        {feedback.description}
                                    </p>
                                </div>
                                <div className='w-full flex items-center justify-between mt-10'>
                                    <div className='bg-[#f2f4ff] flex justify-center items-center w-32 transition duration-200 rounded-xl py-2 px-3 font-semibold text-sm tracking-wider text-blue-500'>
                                        {feedback.tag}
                                    </div>

                                    <div className='hidden md:flex flex-row items-center gap-2'>
                                        <BsFillChatFill className='text-[#cdd2ef]' />
                                        <h3 className='font-bold tracking-wider text-[#373e68]'>
                                            {feedback.post_comments.length}
                                        </h3>
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {convertedEditDate && (
                                        <motion.span
                                            initial={{ opacity: 0, scale: 1 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: 1 }}
                                            className='hidden md:flex flex-row items-center gap-1 text-xs font-semibold tracking-wider text-slate-500'
                                        >
                                            <BiEditAlt /> Edited: (
                                            {convertedEditDate})
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                    <div className=' mt-5 px-5'>
                        <footer className='flex flex-row items-center justify-between mb-5'>
                            <button
                                onClick={() => upvoteFeedback()}
                                className='z-10 md:hidden bg-[#f2f4ff] gap-2 flex justify-center items-center w-16 cursor-pointer transition duration-200 rounded-xl py-2 px-3 font-semibold text-sm tracking-wider'
                            >
                                <BiSolidChevronUp className='text-2xl text-blue-500' />
                                <h3 className='font-bold tracking-wider text-[#373e68]'>
                                    {feedback.upvotes}
                                </h3>
                            </button>
                            <div className='flex md:hidden flex-row items-center gap-2'>
                                <BsFillChatFill className='text-[#cdd2ef]' />
                                <h3 className='font-bold tracking-wider text-[#373e68]'>
                                    {feedback.post_comments.length}
                                </h3>
                            </div>
                        </footer>
                        <AnimatePresence>
                            {convertedEditDate && (
                                <motion.span
                                    initial={{ opacity: 0, scale: 1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: 1 }}
                                    className='md:hidden flex flex-row items-center gap-1 text-xs font-semibold tracking-wider text-slate-500'
                                >
                                    <BiEditAlt /> Edited: ({convertedEditDate})
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.article>
            </header>

            <AnimatePresence>
                <motion.section
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5 }}
                >
                    <CommentInput feedback_id={feedbackId as string} />
                    <div className='w-full px-5 lg:px-24 flex flex-row items-center gap-1 mt-5'>
                        <h2>Sort By: </h2>
                        <DropdownModal
                            options={["New", "Top", "Controversial"]}
                            selectedOption={currentCommentSort}
                            selectOptionStateSetter={setCurrentCommentSort}
                        />
                    </div>
                    <section className='flex flex-col gap-3 px-5 lg:px-24 w-full mt-10'>
                        {sortedFeedbackComments?.map((comment: IComment) => {
                            return (
                                <Comment
                                    feedback_uid={feedbackId as string}
                                    {...comment}
                                />
                            );
                        })}
                    </section>
                </motion.section>
            </AnimatePresence>
        </main>
    );
}
