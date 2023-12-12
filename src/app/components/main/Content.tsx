"use client";

import { useEffect, useState, useContext, useMemo } from "react";
import { db } from "../../firebase/firebaseConfig";
import {
    query,
    orderBy,
    collection,
    onSnapshot,
    where,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { FeedbackContext } from "../../context/FeedbackProvider";

import FeedbackCard from "./FeedbackCard";

type TContentOptions = {
    tag: "All" | "Academic" | "Extracurricular" | "Technology" | "Faculty";
};

export default function Content({ tag }: TContentOptions) {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const memoizedFeedbacks = useMemo(() => [...feedbacks], [feedbacks, tag]);

    const contextValue = useContext(FeedbackContext);
    const { setFeedbackContext } = contextValue || {};

    async function fetchContentInitially() {
        const postRef = collection(db, "posts");

        let q;

        if (tag === "All") {
            q = query(postRef, orderBy("upvotes", "desc"));
        } else {
            q = query(postRef, where("tag", "==", tag));
        }

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

    function sortFeedbacksByTag() {
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
        fetchContentInitially();
    }, []);

    useEffect(() => {
        sortFeedbacksByTag();
    }, [tag]);

    useEffect(() => {
        if (setFeedbackContext) {
            setFeedbackContext(feedbacks.length);
        }
    }, [feedbacks]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className='w-full h-full flex flex-col  mt-5 max-sm:items-center gap-3 md:px-10'
        >
            {memoizedFeedbacks.map((feedback, index) => {
                const isLastFeedback = index === feedbacks.length - 1;

                return (
                    <div key={index}>
                        <FeedbackCard
                            creation_date={feedback.creation_date}
                            creator_email={feedback.creator_email}
                            id={feedback.id}
                            post_comments_length={feedback.post_comments.length}
                            reason={feedback.reason}
                            tag={feedback.tag}
                            title={feedback.title}
                            upvotes_count={feedback.upvotes}
                            upvoters={feedback.upvoters}
                            post_comments={feedback.post_comments}
                            upvotes={feedback.upvotes}
                            isLastFeedback={isLastFeedback}
                        />
                    </div>
                );
            })}
        </motion.div>
    );
}
