"use client";

import { useState, useEffect, useContext } from "react";
import { db } from "@/app/firebase/firebaseConfig";
import { AuthContext } from "@/app/context/AuthProvider";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { BiSolidChevronLeft, BiSolidChevronUp, BiTime } from "react-icons/bi";
import { BsFillChatFill } from "react-icons/bs";
import { LiaEditSolid } from "react-icons/lia";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";

import Loading from "@/app/components/Loading";
import FallbackContent from "@/app/components/FallbackContent";

export default function FeedbackContent() {
    const id = useSearchParams().get("id");
    const router = useRouter();
    const { ...profileProps } = useContext(AuthContext);
    const { profile } = profileProps;

    const [isLoading, setIsLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [feedback, setFeedback] = useState<any>();
    const [convertedFeedbackDate, setConvertedFeedbackDate] = useState("");
    const [documentDoesNotExist, setDocumentDoesNotExist] = useState<
        boolean | undefined
    >(undefined);

    async function fetchDataFromFirebase() {
        if (!id) return;

        const docRef = doc(db, "posts", id as string);

        try {
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists())
                throw new Error(
                    "Error with fetching slug data. Document may not exist."
                );

            setFeedback(docSnap.data());
            setIsLoading(false);
        } catch (error) {
            console.log(error);

            setIsLoading(false);
            setDocumentDoesNotExist(true);
        }
    }

    useEffect(() => {
        fetchDataFromFirebase();
    }, []);

    useEffect(() => {
        if (isLoading) return; // wait for it to load

        if (feedback.creator_email === profile?.email) {
            setIsOwner(true);
        }

        const thisFeedbackDate = new Date(
            feedback.creation_date.seconds * 1000
        );

        setConvertedFeedbackDate(thisFeedbackDate.toLocaleDateString());
    }, [feedback]);

    if (isLoading) {
        return (
            <div className='w-screen h-screen bg-white flex justify-center items-center'>
                <Loading />
            </div>
        );
    }

    if (documentDoesNotExist) {
        return <FallbackContent />;
    }

    function handleRedirectBack() {
        if (!profile?.authenticated) {
            return router.push("/");
        }

        router.push("/main");
    }

    async function upvoteFeedback() {
        try {
            const docRef = doc(db, "posts", id as string);
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

    return (
        <main className='w-screen h-screen bg-[#f7f8fd] px-5 lg:px-24 py-7 overflow-y-auto'>
            <header className='flex flex-col gap-3 w-full'>
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
                        <button className='flex flex-row gap-1 items-center font-semibold tracking-wider text-sm py-4 px-5 text-white bg-[#4661e6] rounded-xl'>
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
                                <h1 className='font-extrabold tracking-wider text-[#373e68]'>
                                    {feedback.title}
                                </h1>
                                <span className='flex -mt-3 flex-row gap-1 items-center font-semibold tracking-wide text-sm text-slate-600'>
                                    <BiTime /> {convertedFeedbackDate}
                                </span>
                                <p className='text-[#373e68] tracking-wide'>
                                    {feedback.reason}
                                </p>
                                <div className='p-2 mr-4 rounded bg-[#fefce8]'>
                                    <p className='text-lg tracking-wide text-[#373e68] whitespace-pre-wrap'>
                                        {feedback.description}
                                    </p>
                                </div>
                                <div className='bg-[#f2f4ff] flex justify-center items-center w-32 transition duration-200 rounded-xl py-2 px-3 font-semibold text-sm tracking-wider text-blue-500'>
                                    {feedback.tag}
                                </div>
                            </div>
                            <div className='hidden md:flex flex-row items-center gap-2'>
                                <BsFillChatFill className='text-[#cdd2ef]' />
                                <h3 className='font-bold tracking-wider text-[#373e68]'>
                                    {feedback.post_comments.length}
                                </h3>
                            </div>
                        </div>
                    </div>
                    <footer className='flex flex-row items-center justify-between mt-5 px-5'>
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
                </motion.article>
            </header>
        </main>
    );
}
