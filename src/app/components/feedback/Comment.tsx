"use client";

import React, { useState, useEffect, useContext } from "react";
import { IComment } from "./CommentInput";
import { formatTimestamp } from "@/app/feedback/[id]/FeedbackContent";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import { TbArrowBigUp, TbArrowBigDown, TbFlag } from "react-icons/tb";
import { AiOutlineDelete } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "@/app/context/AuthProvider";
import { useRouter } from "next/navigation";
import { useDetectClickOutside } from "react-detect-click-outside";
import { getUserUID } from "@/app/utils/feedbackUtils";

import ReplyInput, { IReply } from "./ReplyInput";
import Reply from "./Reply";

interface ICommentProps extends IComment {
    feedback_uid: string;
}

export default function Comment({
    feedback_uid,
    uid,
    user_identifier,
    comment_content,
    comment_upvotes,
    comment_replies,
    comment_identifier,
    comment_creation_date,
}: ICommentProps) {
    const { ...profileProps } = useContext(AuthContext);
    const profile = profileProps.profile;
    const router = useRouter();

    const [upvoted, setUpvoted] = useState(false);
    const [downvoted, setDownvoted] = useState(false);
    const [updatedUserIdentifier, setUpdatedUserIdentifier] =
        useState(user_identifier);
    const [loading, setLoading] = useState(true);
    const [showCommentOptions, setShowCommentOptions] = useState(false);
    const [isReplying, setIsReplying] = useState(false);

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

    function handleUpvoted() {
        setUpvoted(true);

        const unsubscribe = setTimeout(() => {
            setUpvoted(false);
        }, 500);

        return () => unsubscribe;
    }

    function handleDownvoted() {
        setDownvoted(true);

        const unsubscribe = setTimeout(() => {
            setDownvoted(false);
        }, 500);

        return () => unsubscribe;
    }

    function closeIsReplying() {
        setIsReplying(false);
    }

    const ref = useDetectClickOutside({
        onTriggered: () => setShowCommentOptions(false),
    });

    const convertedCommentCreationDate = formatTimestamp(comment_creation_date);
    const currentUserIsCommentOwner = profile?.uid === uid;

    useEffect(() => {
        const handleGetUserUID = async () => {
            const userUID = await getUserUID(profile?.uid as string);

            setUpdatedUserIdentifier(userUID);
        };

        handleGetUserUID();
        setLoading(false);
    }, []);

    if (loading) return <h1>Loading ...</h1>;

    return (
        <>
            <motion.article
                layout
                ref={ref}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className='w-full flex flex-col justify-start bg-white rounded-xl shadow px-10 py-7'
            >
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

                <section className='md:hidden mb-3'>
                    <span className='text-xs text-slate-600 font-semibold tracking-wide'>
                        {convertedCommentCreationDate}
                    </span>
                </section>

                <main className='text-slate-900 tracking-wider mt-1 whitespace-pre-wrap'>
                    {comment_content}
                </main>

                <footer className='flex items-center justify-between'>
                    <div className='flex flex-row items-center gap-1 mt-5'>
                        <button
                            onClick={() => {
                                upvoteComment();
                                handleUpvoted();
                            }}
                            className={`${
                                upvoted ? "-translate-y-2" : ""
                            } transform transition flex py-1 px-2 rounded flex-row items-center group hover:bg-gray-200`}
                        >
                            {upvoted ? (
                                <TbArrowBigUp className='text-xl text-green-500 fill-green-500 transition' />
                            ) : (
                                <TbArrowBigUp className='text-xl text-gray-700 group-hover:text-green-500 transition' />
                            )}
                        </button>
                        <span className='font-semibold text-sm text-slate-700 tracking-wider'>
                            {comment_upvotes}
                        </span>
                        <button
                            onClick={() => {
                                downvoteComment();
                                handleDownvoted();
                            }}
                            className={`${
                                downvoted ? "translate-y-2" : ""
                            } transform transition duration-200 flex py-1 px-2 rounded flex-row items-center group hover:bg-gray-200`}
                        >
                            {downvoted ? (
                                <TbArrowBigDown className='text-xl text-red-400 fill-red-400 transition' />
                            ) : (
                                <TbArrowBigDown className='text-xl text-gray-700 group-hover:text-red-500 transition' />
                            )}
                        </button>
                        <div className='relative'>
                            <button
                                onClick={() =>
                                    setShowCommentOptions(
                                        (prevState) => !prevState
                                    )
                                }
                                className='flex justify-center items-center py-1 px-2 rounded flex-row items-center group focus:bg-gray-200 transition'
                            >
                                <span className='text-2xl text-gray-700'>
                                    ···
                                </span>
                            </button>
                            <AnimatePresence>
                                {showCommentOptions && (
                                    <motion.ul
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        // ref={ref}
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
                    </div>
                    <button
                        onClick={() => setIsReplying((prevState) => !prevState)}
                        className='mt-4'
                    >
                        <span className='font-semibold tracking-wide text-blue-500'>
                            Reply
                        </span>
                    </button>
                </footer>
            </motion.article>

            {comment_replies &&
                comment_replies.map((reply: IReply, index) => {
                    return (
                        <Reply
                            key={index}
                            {...reply}
                            feedback_id={feedback_uid}
                            comment_id={comment_identifier}
                        />
                    );
                })}

            {isReplying && (
                <ReplyInput
                    replying_to={updatedUserIdentifier}
                    feedback_id={feedback_uid}
                    comment_id={comment_identifier}
                    setIsReplying={setIsReplying}
                    closeIsReplying={closeIsReplying}
                />
            )}
        </>
    );
}
