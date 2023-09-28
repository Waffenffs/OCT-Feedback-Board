"use client";

import { useState, useEffect } from "react";
import Loading from "./Loading";
import { BsCheckLg } from "react-icons/bs";
import { AiOutlineClose } from "react-icons/ai";

type TButtonLoadingAnimProps = {
    result: "Success" | "Unsuccessful";
};

export default function ButtonLoadingAnim({ result }: TButtonLoadingAnimProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [showResult, setShowResult] = useState(false);

    // if showresult is true, and result is
    const resElements = {
        Success: <BsCheckLg className='text-white text-2xl' />,
        Unsuccessful: <AiOutlineClose className='text-white text-2xl' />,
    };

    useEffect(() => {
        // write the logic here
        const delay = 2000;

        setTimeout(() => {
            setIsLoading(false);

            setTimeout(() => {
                setShowResult(true);
            }, 500);
        }, delay);
    }, []);

    return (
        <>
            {isLoading && <Loading />}
            {!isLoading && showResult && resElements[result]}
        </>
    );
}
