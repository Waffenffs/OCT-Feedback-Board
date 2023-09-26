"use client";

import { useEffect, useState, useContext } from "react";
import { db } from "../firebase/firebaseConfig";
import {
    query,
    orderBy,
    collection,
    onSnapshot,
    updateDoc,
    doc,
    getDoc,
} from "firebase/firestore";
import FeedbackCard from "./main/FeedbackCard";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthProvider";
import { FeedbackContext } from "../context/FeedbackProvider";
import Loading from "./Loading";

type TContentOptions = {
    option: "Most Upvotes" | "Least Upvotes" | "Date";
    tag: "All" | "Academic" | "Extracurricular" | "Technology" | "Faculty";
};

export default function Content({ option, tag }: TContentOptions) {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const { ...profileProps } = useContext(AuthContext);
    const contextValue = useContext(FeedbackContext);
    const { feedbackAmount, setFeedbackContext } = contextValue || {};
    const { profile } = profileProps;

    async function fetchContentByMostUpvotes() {
        const postRef = collection(db, "posts");
        const q = query(postRef, orderBy("upvotes", "desc"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const firestoreFeedbacks: any = [];

            querySnapshot.forEach((doc) => {
                const documentData = { ...doc.data(), id: doc.id };

                firestoreFeedbacks.push(documentData);
            });

            setFeedbacks(firestoreFeedbacks);
        });

        return () => unsubscribe();
    }

    async function upvoteFeedback(id: string) {
        try {
            const feedbackRef = doc(db, "posts", id);
            const feedbackSnap = await getDoc(feedbackRef);

            if (alreadyUpvoted(id)) {
                const filteredUpvoters = feedbackSnap
                    .data()
                    ?.upvoters.filter(
                        (upvoter: any) => upvoter !== profile?.email
                    );

                await updateDoc(feedbackRef, {
                    upvotes: feedbackSnap.data()?.upvotes - 1,
                    upvoters: filteredUpvoters,
                });
            } else {
                const updatedUpvoters = feedbackSnap.data()?.upvoters;
                updatedUpvoters.push(profile?.email);

                await updateDoc(feedbackRef, {
                    upvotes: feedbackSnap.data()?.upvotes + 1,
                    upvoters: updatedUpvoters,
                });
            }
        } catch (error) {
            console.error(`Error with upvoting: ${error}`);
        }
    }

    function alreadyUpvoted(id: string): boolean {
        const feedback = feedbacks.filter((feedback) => feedback.id === id);
        const email = profile && profile.email;

        if (email !== undefined && email !== null) {
            if (feedback[0].upvoters.includes(email)) {
                return true;
            }
        } else {
            console.error(`Email does not seem to persist.`);
        }

        return false;
    }

    function sortFeedbacksByTag() {
        // unshift & push
        let tagUpdatedFeedbacks: any[] = [];

        feedbacks.map((feedback) => {
            if (feedback.tag !== tag) {
                tagUpdatedFeedbacks.push(feedback);
            } else {
                tagUpdatedFeedbacks.unshift(feedback);
            }
        });

        setFeedbacks(tagUpdatedFeedbacks);
    }

    useEffect(() => {
        fetchContentByMostUpvotes();
        setLoading(false);
    }, [loading]);

    useEffect(() => {
        console.log(`Tag changed: ${tag}`);
        sortFeedbacksByTag();
    }, [tag]);

    useEffect(() => {
        if (setFeedbackContext) {
            setFeedbackContext(feedbacks.length);
        }
    }, [feedbacks]);

    if (loading) {
        return (
            <div className='w-full h-full bg-white flex justify-center items-center'>
                <Loading />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.5 }}
            className='w-full h-full flex flex-col max-sm:items-center gap-3 mt-5 md:px-10'
        >
            <AnimatePresence>
                {feedbacks.map((feedback, index) => {
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <FeedbackCard
                                creation_date={feedback.creation_date}
                                creator_email={feedback.creator_email}
                                id={feedback.id}
                                post_comments_length={
                                    feedback.post_comments.length
                                }
                                reason={feedback.reason}
                                tag={feedback.tag}
                                title={feedback.title}
                                upvotes_count={feedback.upvotes}
                                upvoters={feedback.upvoters}
                                post_comments={feedback.post_comments}
                                upvotes={feedback.upvotes}
                                upvoteFeedback={upvoteFeedback}
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </motion.div>
    );
}
