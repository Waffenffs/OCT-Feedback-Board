"use client";

import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/app/context/AuthProvider";
import {
    doc,
    onSnapshot,
    updateDoc,
    Timestamp,
    arrayUnion,
} from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import { AnimatePresence } from "framer-motion";

import StatusModal from "../StatusModal";

interface IComment {
    uid: string;
    user_identifier: string;
    email: string;
    comment_content: string;
    comment_upvotes: number;
    comment_replies: {} | undefined;
    comment_creation_date: any;
}

type TCommentInputProps = {
    feedback_id: string;
};

enum StatusModalType {
    Success = "success",
    Error = "error",
}

export default function CommentInput({ feedback_id }: TCommentInputProps) {
    const [userIdentifier, setUserIdentifier] = useState<string | undefined>(
        undefined
    );
    const [commentContent, setCommentContent] = useState("");
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusModalIsSuccess, setStatusModalIsSuccess] =
        useState<StatusModalType>(StatusModalType.Success);

    const { ...profileProps } = useContext(AuthContext);
    const { profile } = profileProps;

    const statusMessages = {
        [StatusModalType.Success]: "Successfully posted your comment!",
        [StatusModalType.Error]: "Failed posting your comment! Try again.",
    };

    async function getUserIdentifier() {
        try {
            const userRef = doc(db, "users", profile?.uid as string);
            const unsubscribe = onSnapshot(userRef, (doc) => {
                const identifier = doc.data()?.user_identifier;

                setUserIdentifier(identifier);
            });

            return () => unsubscribe();
        } catch (error) {
            console.error(error);
        }
    }

    async function postComment() {
        const newComment: IComment = {
            uid: profile?.uid as string,
            user_identifier: userIdentifier as string,
            email: profile?.email as string,
            comment_content: commentContent.trim(),
            comment_upvotes: 0,
            comment_replies: {},
            comment_creation_date: Timestamp.now(),
        };

        try {
            const feedbackRef = doc(db, "posts", feedback_id);

            await updateDoc(feedbackRef, {
                post_comments: arrayUnion(newComment),
            });

            setStatusModalIsSuccess(StatusModalType.Success);

            clearCommentContent();
            displayStatusModal();
        } catch (error) {
            console.error(error);

            setStatusModalIsSuccess(StatusModalType.Error);

            clearCommentContent();
            displayStatusModal();
        }
    }

    function handlePostComment() {
        const commentValidity = checkCommentValidity();

        if (commentValidity === StatusModalType.Error) {
            setStatusModalIsSuccess(StatusModalType.Error);
            displayStatusModal();

            return;
        }

        postComment();
    }

    function checkCommentValidity() {
        const minimumCommentLength = 5;

        if (commentContent.trim().length <= minimumCommentLength) {
            return StatusModalType.Error;
        }

        return StatusModalType.Success;
    }

    function clearCommentContent() {
        setCommentContent("");
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
        getUserIdentifier();
    }, []);

    if (!userIdentifier) return <LoadingCommentInput />;

    return (
        <>
            <AnimatePresence>
                {showStatusModal && (
                    <StatusModal
                        key={8}
                        type='user_database_write'
                        message={statusMessages[statusModalIsSuccess]}
                        setShowModal={setShowStatusModal}
                        isSuccess={
                            statusModalIsSuccess === StatusModalType.Success
                                ? true
                                : false
                        }
                    />
                )}
            </AnimatePresence>
            <div className='w-full flex flex-col gap-3 justify-start mt-20'>
                <div className='flex flex-row items-center gap-1 text-sm'>
                    <h3 className='tracking-wider'>Comment as</h3>{" "}
                    <span className='font-semibold text-blue-500 tracking-wider'>
                        {" "}
                        {userIdentifier}
                    </span>
                </div>

                <form
                    onSubmit={(e) => e.preventDefault()}
                    className='flex flex-col'
                >
                    <textarea
                        cols={30}
                        rows={5}
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        className='border border-slate-300 w-full px-5 pt-2 focus:outline-none resize-none'
                        placeholder='What are your thoughts?'
                    />
                    <div className='w-full rounded-b-xl flex flex-row justify-end bg-slate-300 py-2 px-4'>
                        <button
                            onClick={() => handlePostComment()}
                            className='rounded-xl bg-blue-400 font-semibold text-white tracking-wider px-5 py-1 text-sm'
                        >
                            Comment
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

function LoadingCommentInput() {
    return (
        <div className='w-full flex flex-col gap-3 justify-start animate-pulse mt-16'>
            <div className='h-2.5 w-24 bg-blue-200 dark:bg-blue-300'></div>
            <div className='w-full flex flex-col'>
                <div className='px-4 h-24 w-full px-5 pt-2 border border-slate-300'>
                    <div className='h-4 w-24 bg-blue-200 dark:bg-blue-300'></div>
                </div>
                <div className='rounded-b-full h-10 bg-slate-300 rounded-b-xl flex items-center flex-row justify-end py-2 px-4'>
                    <button className='rounded-full bg-blue-400 h-4 w-24'></button>
                </div>
            </div>
        </div>
    );
}
