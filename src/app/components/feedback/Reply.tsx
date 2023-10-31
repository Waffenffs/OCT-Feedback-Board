"use client";

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/app/context/AuthProvider";
import { IReply } from "./ReplyInput";
import { IComment } from "./CommentInput";
import { AnimatePresence, motion } from "framer-motion";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import { formatTimestamp } from "@/app/feedback/[id]/FeedbackContent";
import { TbFlag } from "react-icons/tb";
import { AiOutlineDelete } from "react-icons/ai";

interface IReplyProps extends IReply {
    feedback_id: string;
    comment_id: string;
}

export default function Reply({ ...props }: IReplyProps) {
    const [updatedUserIdentifier, setUpdatedUserIdentifier] = useState(
        props.user_identifier
    );
    const [showReplyOptions, setShowReplyOptions] = useState(false);

    const { ...profileProps } = useContext(AuthContext);

    async function getUpdatedUserIdentifier() {
        try {
            const userRef = doc(db, "users", props.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) throw new Error("User does not exist!");

            const firestoreUserIdentifier = userSnap.data().user_identifier;

            if (firestoreUserIdentifier !== updatedUserIdentifier) {
                setUpdatedUserIdentifier(firestoreUserIdentifier);
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function deleteReply() {
        try {
            const feedbackRef = doc(db, "posts", props.feedback_id);
            const feedbackSnap = await getDoc(feedbackRef);

            if (!feedbackSnap.exists())
                throw new Error("Feedback does not exist!");

            const feedbackComments = feedbackSnap.data().post_comments;
            const commentRef = feedbackComments.find(
                (comment: IComment) =>
                    comment.comment_identifier === props.comment_id
            );

            if (!commentRef) throw new Error("Comment does not exist!");

            const filteredCommentReplies = commentRef.comment_replies.filter(
                (reply: IReply) =>
                    reply.reply_identifier !== props.reply_identifier
            );
            const updatedComment = {
                ...commentRef,
                comment_replies: filteredCommentReplies,
            };
            const updatedFeedbackComments = [
                ...feedbackComments.filter(
                    (comment: IComment) =>
                        comment.comment_identifier !== props.comment_id
                ),
                updatedComment,
            ];

            await updateDoc(feedbackRef, {
                post_comments: updatedFeedbackComments,
            });
        } catch (error) {
            console.error(error);
        }
    }

    const convertedReplyCreationDate = formatTimestamp(
        props.reply_creation_date
    );
    const currentUserIsReplyOwner = profileProps?.profile?.uid === props.uid;

    useEffect(() => {
        getUpdatedUserIdentifier();
    }, []);

    return (
        <div className='w-full pl-16 md:pl-48'>
            <motion.article
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                layout
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
                        {convertedReplyCreationDate}
                    </span>
                </header>

                <section className='md:hidden mb-3'>
                    <span className='text-xs text-slate-600 font-semibold tracking-wide'>
                        {convertedReplyCreationDate}
                    </span>
                </section>

                <main className='text-slate-900 tracking-wider mt-1 whitespace-pre-wrap'>
                    {props.reply_content}
                </main>

                <footer className='flex items-center justify-between'>
                    <div className='flex flex-row items-center gap-1 mt-5'>
                        <div className='relative'>
                            <button
                                onClick={() =>
                                    setShowReplyOptions(
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
                                {showReplyOptions && (
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
                                        {currentUserIsReplyOwner && (
                                            <li
                                                onClick={() => deleteReply()}
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
                </footer>
            </motion.article>
        </div>
    );
}
