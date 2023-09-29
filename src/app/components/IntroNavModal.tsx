import { AiFillHeart } from "react-icons/ai";

export default function IntroNavModal() {
    return (
        <div className='shadow-xl w-full rounded-full px-5 py-3 flex flex-row items-center bg-gradient-to-l from-rose-400 via-fuchsia-500 to-indigo-500'>
            <h1 className='text-white font-semibold tracking-wide flex flex-row items-center gap-1'>
                Made with <AiFillHeart className='text-red-600 text-xl' /> by{" "}
                <span className='hover:underline cursor-pointer'>Waffen.</span>
            </h1>
        </div>
    );
}
