"use client";

import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/app/context/AuthProvider";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";

export default function CommentInput() {
    const [userIdentifier, setUserIdentifier] = useState<string | undefined>(
        undefined
    );

    const { ...profileProps } = useContext(AuthContext);
    const { profile } = profileProps;

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
        // directly post comment to database
    }

    async function handlePostComment() {
        // use post comment and checkCommentValidity here
    }

    async function checkCommentValidity() {
        // check comment validity
    }

    useEffect(() => {
        getUserIdentifier();
    }, []);

    if (!userIdentifier) return <LoadingCommentInput />;

    return (
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
                    className='border border-slate-300 w-full px-5 pt-2 focus:outline-none resize-none'
                    placeholder='What are your thoughts?'
                />
                <div className='w-full rounded-b-xl flex flex-row justify-end bg-slate-300 py-2 px-4'>
                    <button className='rounded-full bg-blue-400 font-semibold text-white tracking-wider px-5 py-1 text-sm'>
                        Comment
                    </button>
                </div>
            </form>
        </div>
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
