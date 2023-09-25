"use client";

import React, { createContext, useState } from "react";

type TFeedbackContext = {
    feedbackAmount: number;
    setFeedbackContext:
        | React.Dispatch<React.SetStateAction<number>>
        | undefined;
};

export const FeedbackContext = createContext<TFeedbackContext | undefined>(
    undefined
);

export function FeedbackProvider({ children }: React.PropsWithChildren<{}>) {
    const [feedbackAmount, setFeedbackAmount] = useState<number>(0);

    const contextValue: TFeedbackContext = {
        feedbackAmount,
        setFeedbackContext: setFeedbackAmount,
    };

    return (
        <FeedbackContext.Provider value={contextValue}>
            {children}
        </FeedbackContext.Provider>
    );
}
