"use client";

import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

import Link from "next/link";

export default function FallbackContent() {
    const { ...profileProps } = useContext(AuthContext);
    const { profile } = profileProps;

    return (
        <div className='w-screen h-screen bg-white flex flex-col justify-center items-center'>
            <h1 className='text-8xl font-extrabold tracking-wider text-green-600'>
                404
            </h1>
            <div className='w-64 h-64 mt-6'>
                <img src='/404_icon.svg' alt='' className='object-cover' />
            </div>
            <h3 className='font-semibold tracking-wider text-slate-600 text-sm'>
                Seems like spilled paint.
            </h3>
            <button className='mt-9'>
                <Link
                    href={`${profile?.authenticated ? "/main" : "/"}`}
                    className='py-1 text-white font-semibold tracking-wider px-10 bg-orange-400 border-2 border-orange-400 rounded-md transition duration-300 hover:bg-green-600 shadow'
                >
                    <span>Back To Content</span>
                </Link>
            </button>
        </div>
    );
}
