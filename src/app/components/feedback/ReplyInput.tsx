"use client";

import { useState, useContext, useEffect } from "react";
import { AuthContext } from "@/app/context/AuthProvider";
import { AnimatePresence, motion } from "framer-motion";
import { MiniLoadingSpinner } from "./CommentInput";
import { EStatusModal } from "./CommentInput";
import { db } from "@/app/firebase/firebaseConfig";
import { getDoc, updateDoc, doc, Timestamp } from "firebase/firestore";
import { useDetectClickOutside } from "react-detect-click-outside";
import type { IComment } from "./CommentInput";
import { getUserUID } from "@/app/utils/feedbackUtils";

import StatusModal from "../StatusModal";

export interface IReply {
    uid: string;
    user_identifier: string;
    email: string;
    reply_content: string;
    reply_upvotes: number;
    reply_upvoters: string[];
    reply_downvotes: number;
    reply_downvoters: string[];
    reply_identifier: string;
    reply_creation_date: any;
}

type TReplyInputProps = {
    replying_to: string;
    feedback_id: string;
    comment_id: string;
    setIsReplying: React.Dispatch<React.SetStateAction<boolean>>;
    closeIsReplying(): void;
};

export default function ReplyInput({
    replying_to,
    feedback_id,
    comment_id,
    setIsReplying,
    closeIsReplying,
}: TReplyInputProps) {
    const [replyContent, setReplyContent] = useState("");
    const [showStatusLoading, setShowStatusLoading] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusModalIsSuccess, setStatusModalIsSuccess] =
        useState<EStatusModal>(EStatusModal.Success);
    const [userIdentifier, setUserIdentifier] = useState<string | undefined>(
        undefined
    );

    const { ...profileProps } = useContext(AuthContext);
    const { profile } = profileProps;

    const statusMessages = {
        [EStatusModal.Success]: "Successfully replied!",
        [EStatusModal.Error]: "Failed replying to comment! Try again.",
    };

    const ref = useDetectClickOutside({ onTriggered: closeIsReplying });

    async function reply() {
        const newReply: IReply = {
            uid: profile?.uid as string,
            user_identifier: userIdentifier as string,
            email: profile?.email as string,
            reply_content: replyContent.trim(),
            reply_upvotes: 0,
            reply_upvoters: [],
            reply_downvotes: 0,
            reply_downvoters: [],
            reply_identifier: generateUID(),
            reply_creation_date: Timestamp.now(),
        };

        try {
            const feedbackRef = doc(db, "posts", feedback_id);
            const feedbackSnap = await getDoc(feedbackRef);

            if (!feedbackSnap.exists())
                throw new Error("Feedback does not exist!");

            const feedbackComments = feedbackSnap.data().post_comments;
            const filteredFeedbackComments: any = feedbackComments.find(
                (comment: IComment) => comment.comment_identifier === comment_id
            );

            if (!filteredFeedbackComments)
                throw new Error("Comment does not exist!");

            const updatedCommentReplies = [
                ...filteredFeedbackComments.comment_replies,
                newReply,
            ];
            const updatedComment = {
                ...filteredFeedbackComments,
                comment_replies: updatedCommentReplies,
            };
            const updatedFeedbackComments = [
                ...feedbackComments.filter(
                    (comment: IComment) =>
                        comment.comment_identifier !== comment_id
                ),
                updatedComment,
            ];

            await updateDoc(feedbackRef, {
                post_comments: updatedFeedbackComments,
            });

            setStatusModalIsSuccess(EStatusModal.Success);
            setShowStatusLoading(false);
            setReplyContent("");
            setIsReplying(false);

            displayStatusModal();
        } catch (error) {
            console.error(error);
        }
    }

    function handleReply() {
        setShowStatusLoading(true);

        setTimeout(() => {
            const replyValidity = checkReplyValidity();

            if (replyValidity === EStatusModal.Error) {
                setStatusModalIsSuccess(EStatusModal.Error);
                setShowStatusLoading(false);

                displayStatusModal();
            } else {
                reply();
            }
        }, 1000);
    }

    function generateUID() {
        return Math.random().toString(36).substr(2, 9);
    }

    function checkReplyValidity(): EStatusModal {
        const minimumReplyLength = 5;

        if (replyContent.trim().length <= minimumReplyLength) {
            return EStatusModal.Error;
        }

        return EStatusModal.Success;
    }

    function displayStatusModal() {
        setTimeout(() => {
            setShowStatusModal(true);

            setTimeout(() => {
                setShowStatusModal(false);
            }, 3000);
        }, 1000);
    }

    useEffect(() => {
        const handleGetUserUID = async () => {
            const userUID = await getUserUID(profile?.uid as string);

            setUserIdentifier(userUID);
        };

        handleGetUserUID();
    }, []);

    return (
        <>
            <AnimatePresence>
                {showStatusModal && (
                    <StatusModal
                        key={9}
                        type='user_database_write'
                        message={statusMessages[statusModalIsSuccess]}
                        setShowModal={setShowStatusModal}
                        isSuccess={
                            statusModalIsSuccess === EStatusModal.Success
                                ? true
                                : false
                        }
                    />
                )}
            </AnimatePresence>

            <div className='pl-16 md:pl-48 flex flex-col gap-3' ref={ref}>
                <div className='flex flex-row items-center gap-1 text-sm'>
                    <h3 className='tracking-wider'>Replying to</h3>{" "}
                    <span className='font-semibold text-blue-500 tracking-wider'>
                        {" "}
                        {replying_to}
                    </span>
                </div>

                <form
                    onSubmit={(e) => e.preventDefault()}
                    className='flex flex-col'
                >
                    <textarea
                        cols={30}
                        rows={5}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className='border border-slate-300 w-full px-5 pt-2 focus:outline-none resize-none'
                        placeholder='What are your thoughts?'
                    />
                    <div className='w-full rounded-b-xl flex flex-row justify-end bg-slate-300 py-2 px-4 h-12'>
                        <button
                            onClick={() => handleReply()}
                            disabled={showStatusLoading}
                            className='w-28 rounded-xl bg-blue-400 font-semibold text-white tracking-wider px-5 py-1 text-sm'
                        >
                            <AnimatePresence>
                                {showStatusLoading ? (
                                    <motion.div
                                        key={1}
                                        initial={{ opacity: 0, scale: 1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0 }}
                                    >
                                        <MiniLoadingSpinner />
                                    </motion.div>
                                ) : (
                                    <motion.span
                                        key={1}
                                        initial={{ opacity: 0, scale: 1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0 }}
                                    >
                                        Reply
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
