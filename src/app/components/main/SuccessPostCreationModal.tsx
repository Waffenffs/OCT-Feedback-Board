import { AiOutlineClose } from "react-icons/ai";
import { BsCheckLg } from "react-icons/bs";
import { ImLink } from "react-icons/im";
import { useState } from "react";
import { motion } from "framer-motion";

import Link from "next/link";

type TSuccessPostCreationModalProps = {
    setPostCreationSuccessful: React.Dispatch<React.SetStateAction<boolean>>;
    latestCreatedFeedbackId: string;
};

export default function SuccessPostCreationModal({
    setPostCreationSuccessful,
    latestCreatedFeedbackId,
}: TSuccessPostCreationModalProps) {
    const [clicked, setClicked] = useState(false);

    const domain = window.location.origin;
    const generatedURL = `${domain}/feedback/redirect?id=${latestCreatedFeedbackId}`;

    return (
        <motion.article
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3 }}
            className='w-screen h-screen fixed z-20 flex justify-center items-center'
        >
            <div className='w-80 lg:w-[30rem] bg-white py-5 rounded-2xl shadow-2xl shadow-green-300 border'>
                <header className='w-full px-3 flex justify-end items-center'>
                    <button
                        onClick={() => setPostCreationSuccessful(false)}
                        className='rounded-full p-3 bg-[#1d1d1f] flex justify-center items-center'
                    >
                        <AiOutlineClose className='text-white' />
                    </button>
                </header>
                <div className='w-full flex flex-col justify-center items-center mt-5'>
                    <div className='p-3 rounded-full bg-green-100'>
                        <div className='p-3 rounded-full bg-green-200'>
                            <div className='p-3 rounded-full bg-green-300'>
                                <div className='rounded-full bg-green-500 flex justify-center items-center w-20 h-20'>
                                    <BsCheckLg className='text-white text-4xl' />
                                </div>
                            </div>
                        </div>
                    </div>

                    <h1 className='text-xl font-extrabold text-[#373e68] tracking-wider text-center mt-4'>
                        Feedback Created Successfully
                    </h1>
                </div>

                <footer className='bg-emerald-50 py-5 text-center flex flex-col gap-2 justify-center items-center mt-12 mb-6'>
                    <h3 className='font-semibold tracking-wider text-slate-600 text-sm'>
                        Share it with your friends!
                    </h3>
                </footer>

                <div className='w-full flex flex-row items-center justify-between px-5'>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(generatedURL);

                            setClicked(true);

                            const unsubscribe = setTimeout(() => {
                                setClicked(false);
                            }, 1000);

                            return () => clearTimeout(unsubscribe);
                        }}
                        className='flex flex-row justify-center items-center gap-1 cursor-pointer'
                    >
                        <ImLink className='text-blue-500 text-2xl' />
                        <span className='font-bold text-blue-500 whitespace-nowrap'>
                            {!clicked ? "Copy Link" : "Link Copied!"}
                        </span>
                    </button>
                    <Link href={generatedURL}>
                        <span className='font-bold text-blue-500 text-sm tracking-wider'>
                            Open
                        </span>
                    </Link>
                </div>
            </div>
        </motion.article>
    );
}
