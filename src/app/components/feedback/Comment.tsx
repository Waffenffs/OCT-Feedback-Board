"use client";

import { useState, useEffect, useContext } from "react";
import { IComment } from "./CommentInput";
import { formatTimestamp } from "@/app/feedback/[id]/FeedbackContent";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import { TbArrowBigUp, TbArrowBigDown, TbFlag } from "react-icons/tb";
import { AiOutlineDelete } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "@/app/context/AuthProvider";
import { useRouter } from "next/navigation";

interface ICommentProps extends IComment {
    feedback_uid: string;
}

export default function Comment({
    feedback_uid,
    uid,
    user_identifier,
    // email,
    comment_content,
    comment_upvotes,
    comment_replies,
    comment_identifier,
    comment_creation_date,
}: ICommentProps) {
    const { ...profileProps } = useContext(AuthContext);
    const profile = profileProps.profile;
    const router = useRouter();

    const [updatedUserIdentifier, setUpdatedUserIdentifier] =
        useState(user_identifier);
    const [loading, setLoading] = useState(true);
    const [showCommentOptions, setShowCommentOptions] = useState(false);
    // Redirect user to login page if

    async function getUpdatedUserIdentifier() {
        try {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) throw new Error("User does not exist!");

            const firestoreUserIdentifier = userSnap.data().user_identifier;

            if (firestoreUserIdentifier !== user_identifier) {
                setUpdatedUserIdentifier(firestoreUserIdentifier);
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function upvoteComment() {
        try {
            if (!profile?.authenticated) {
                return router.push("/");
            }

            const feedbackRef = doc(db, "posts", feedback_uid);
            const feedbackSnap = await getDoc(feedbackRef);

            if (!feedbackSnap.exists())
                throw new Error("Feedback does not exist! Origin: Comment.tsx");

            let comments = feedbackSnap.data().post_comments;
            let commentIndex = comments.findIndex(
                (comment: IComment) =>
                    comment.comment_identifier === comment_identifier
            );

            if (commentIndex === -1)
                throw new Error("Comment does not exist! Origin: Comment.tsx");

            let comment = comments[commentIndex];

            if (comment.comment_upvoters.includes(uid)) {
                comment.comment_upvotes -= 1;
                comment.comment_upvoters = comment.comment_upvoters.filter(
                    (upvoter_uid: string) => upvoter_uid !== uid
                );
            } else if (!comment.comment_upvoters.includes(uid)) {
                comment.comment_upvotes += 1;
                comment.comment_upvoters.push(uid);
            }

            comments[commentIndex] = comment;

            await updateDoc(feedbackRef, {
                post_comments: comments,
            });
        } catch (error) {
            console.error(error);
        }
    }

    async function downvoteComment() {
        try {
            if (!profile?.authenticated) {
                return router.push("/");
            }

            const feedbackRef = doc(db, "posts", feedback_uid);
            const feedbackSnap = await getDoc(feedbackRef);

            if (!feedbackSnap.exists())
                throw new Error("Feedback does not exist! Origin: Comment.tsx");

            let comments = feedbackSnap.data().post_comments;
            let commentIndex = comments.findIndex(
                (comment: IComment) =>
                    comment.comment_identifier === comment_identifier
            );

            if (commentIndex === -1)
                throw new Error("Comment does not exist! Origin: Comment.tsx");

            let comment = comments[commentIndex];

            if (comment.comment_downvoters.includes(uid)) {
                comment.comment_downvotes -= 1;
                comment.comment_downvoters = comment.comment_downvoters.filter(
                    (upvoter_uid: string) => upvoter_uid !== uid
                );
            }
            if (!comment.comment_downvoters.includes(uid)) {
                comment.comment_downvotes += 1;
                comment.comment_downvoters.push(uid);
            }
            if (comment.comment_upvoters.includes(uid)) {
                comment.comment_upvotes -= 1;
                comment.comment_upvoters = comment.comment_upvoters.filter(
                    (upvoter_uid: string) => upvoter_uid !== uid
                );
            }

            comments[commentIndex] = comment;

            await updateDoc(feedbackRef, {
                post_comments: comments,
            });
        } catch (error) {
            console.error(error);
        }
    }

    async function deleteComment() {
        try {
            const feedbackRef = doc(db, "posts", feedback_uid);
            const feedbackSnap = await getDoc(feedbackRef);

            if (!feedbackSnap.exists())
                throw new Error(`Feedback does not exist! Origin: Comment.tsx`);

            const comments = feedbackSnap.data().post_comments;
            const updatedComments = comments.filter(
                (comment: IComment) =>
                    comment.comment_identifier !== comment_identifier
            );

            await updateDoc(feedbackRef, {
                post_comments: updatedComments,
            });
        } catch (error) {
            console.error(error);
        }
    }

    const convertedCommentCreationDate = formatTimestamp(comment_creation_date);
    const currentUserIsCommentOwner = profile?.uid === uid;

    useEffect(() => {
        getUpdatedUserIdentifier();
        setLoading(false);
    }, []);

    if (loading) return <h1>Loading ...</h1>;

    return (
        <article className='w-full flex flex-col justify-start bg-white rounded-xl shadow px-10 py-7'>
            <header className='flex flex-row items-center gap-2'>
                <h3 className='font-semibold text-sm text-slate-700 tracking-wider'>
                    {updatedUserIdentifier}
                </h3>

                <span className='hidden md:block text-xl text-slate-600 font-semibold'>
                    ·
                </span>

                <span className='hidden md:block text-xs text-slate-600 font-semibold tracking-wide'>
                    {convertedCommentCreationDate}
                </span>
            </header>

            <main className='text-slate-900 tracking-wider mt-1'>
                {comment_content}
            </main>

            <footer className='flex flex-row items-center gap-1 mt-5'>
                <button
                    onClick={() => upvoteComment()}
                    className='flex py-1 px-2 rounded flex-row items-center group hover:bg-gray-200 transition'
                >
                    <TbArrowBigUp className='text-xl text-gray-700 group-hover:text-green-500 transition' />
                </button>
                <span className='font-semibold text-sm text-slate-700 tracking-wider'>
                    {comment_upvotes}
                </span>
                <button
                    onClick={() => downvoteComment()}
                    className='flex py-1 px-2 rounded flex-row items-center group hover:bg-gray-200 transition'
                >
                    <TbArrowBigDown className='text-xl text-gray-700 group-hover:text-red-500 transition' />
                </button>
                <div className='relative'>
                    <button
                        onClick={() =>
                            setShowCommentOptions((prevState) => !prevState)
                        }
                        className='flex justify-center items-center py-1 px-2 rounded flex-row items-center group focus:bg-gray-200 transition'
                    >
                        <span className='text-2xl text-gray-700'>···</span>
                    </button>
                    <AnimatePresence>
                        {showCommentOptions && (
                            <motion.ul
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className='absolute bg-gray-300 top-9 rounded shadow'
                            >
                                <li className='flex flex-row items-center gap-1 py-1 px-3 cursor-pointer transition group hover:bg-red-500 rounded-t'>
                                    <TbFlag className='text-slate-800 transition group-hover:text-white' />
                                    <span className='text-sm font-semibold text-slate-800 tracking-wide transition group-hover:text-white'>
                                        Report
                                    </span>
                                </li>
                                {currentUserIsCommentOwner && (
                                    <li
                                        onClick={() => deleteComment()}
                                        className='flex flex-row items-center gap-1 py-1 px-3 cursor-pointer transition group hover:bg-blue-500 rounded-b'
                                    >
                                        <AiOutlineDelete className='text-slate-800 transition group-hover:text-white' />
                                        <span className='text-sm font-semibold text-slate-800 tracking-wide transition group-hover:text-white'>
                                            Delete
                                        </span>
                                    </li>
                                )}
                            </motion.ul>
                        )}
                    </AnimatePresence>
                </div>
            </footer>
        </article>
    );
}
