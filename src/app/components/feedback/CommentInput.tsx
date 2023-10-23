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
import { AnimatePresence, motion } from "framer-motion";

import StatusModal from "../StatusModal";

// Yes, I know it's bad infrastructure in my part--
// -- as we could just get the lengths of comment_upvoters/comment_downvoters to get the amount

export interface IComment {
    uid: string;
    user_identifier: string;
    email: string;
    comment_content: string;
    comment_upvotes: number;
    comment_upvoters: string[];
    comment_downvotes: number;
    comment_downvoters: string[];
    comment_identifier: string;
    comment_replies: {} | undefined;
    comment_creation_date: any;
}

type TCommentInputProps = {
    feedback_id: string;
};

enum EStatusModalType {
    Success = "success",
    Error = "error",
}

export default function CommentInput({ feedback_id }: TCommentInputProps) {
    const [userIdentifier, setUserIdentifier] = useState<string | undefined>(
        undefined
    );
    const [commentContent, setCommentContent] = useState("");
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showStatusLoading, setShowStatusLoading] = useState(false);
    const [statusModalIsSuccess, setStatusModalIsSuccess] =
        useState<EStatusModalType>(EStatusModalType.Success);

    const { ...profileProps } = useContext(AuthContext);
    const { profile } = profileProps;

    const statusMessages = {
        [EStatusModalType.Success]: "Successfully posted your comment!",
        [EStatusModalType.Error]: "Failed posting your comment! Try again.",
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
            comment_upvoters: [],
            comment_downvotes: 0,
            comment_downvoters: [],
            comment_identifier: generateUID(),
            comment_replies: {},
            comment_creation_date: Timestamp.now(),
        };

        try {
            const feedbackRef = doc(db, "posts", feedback_id);

            await updateDoc(feedbackRef, {
                post_comments: arrayUnion(newComment),
            });

            setStatusModalIsSuccess(EStatusModalType.Success);
            setShowStatusLoading(false);

            clearCommentContent();
            displayStatusModal();
        } catch (error) {
            console.error(error);

            setStatusModalIsSuccess(EStatusModalType.Error);
            setShowStatusLoading(false);

            clearCommentContent();
            displayStatusModal();
        }
    }

    function generateUID() {
        return Math.random().toString(36).substr(2, 9);
    }

    function handlePostComment() {
        setShowStatusLoading(true);

        setTimeout(() => {
            const commentValidity = checkCommentValidity();

            if (commentValidity === EStatusModalType.Error) {
                setStatusModalIsSuccess(EStatusModalType.Error);
                setShowStatusLoading(false);

                displayStatusModal();
            } else {
                postComment();
            }
        }, 1000);
    }

    function checkCommentValidity(): EStatusModalType {
        const minimumCommentLength = 5;

        if (commentContent.trim().length <= minimumCommentLength) {
            return EStatusModalType.Error;
        }

        return EStatusModalType.Success;
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
                            statusModalIsSuccess === EStatusModalType.Success
                                ? true
                                : false
                        }
                    />
                )}
            </AnimatePresence>

            <div className='w-full flex flex-col gap-3 justify-start mt-20 px-5 lg:px-24'>
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
                    <div className='w-full rounded-b-xl flex flex-row justify-end bg-slate-300 py-2 px-4 h-12'>
                        <button
                            onClick={() => handlePostComment()}
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
                                        Comment
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

function MiniLoadingSpinner() {
    return (
        <div className='w-full h-full flex justify-center items-center'>
            <div role='status'>
                <svg
                    aria-hidden='true'
                    className='w-4 h-4  text-gray-200 animate-spin dark:text-white-600 fill-blue-600'
                    viewBox='0 0 100 101'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                >
                    <path
                        d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                        fill='currentColor'
                    />
                    <path
                        d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                        fill='currentFill'
                    />
                </svg>
                <span className='sr-only'>Loading...</span>
            </div>
        </div>
    );
}
