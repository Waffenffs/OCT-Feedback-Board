import Link from "next/link";
import { BiSolidChevronUp } from "react-icons/bi";
import { BsFillChatFill } from "react-icons/bs";

export type TFeedbackCardProps = {
    creation_date: any;
    creator_email: string;
    id: string;
    post_comments: any[];
    post_comments_length: number;
    reason: string;
    tag: string;
    title: string;
    upvotes_count: number;
    upvotes: number;
    upvoters: string[];
    upvoteFeedback(id: string): Promise<void>;
};

export default function FeedbackCard({ ...props }: TFeedbackCardProps) {
    function handleUpvoteClick(e: any) {
        e.stopPropagation();
        e.nativeEvent.preventDefault();
        props.upvoteFeedback(props.id);
    }

    return (
        <article className='feedback-card bg-white rounded md:rounded-xl py-6 px-5 w-80 md:w-full md:border transition duration-150'>
            <div className='flex flex-row gap-5'>
                <div className='md:block'>
                    <button
                        onClick={(e) => handleUpvoteClick(e)}
                        className='hidden hover:border-slate-500 border z-10 bg-[#f2f4ff] gap-1 md:flex flex-col justify-center items-center w-16 cursor-pointer transition duration-200 rounded-xl py-2 px-3 font-semibold text-sm tracking-wider'
                    >
                        <BiSolidChevronUp className='text-2xl text-blue-500' />
                        <h3 className='font-bold tracking-wider text-[#373e68]'>
                            {props.upvotes_count}
                        </h3>
                    </button>
                </div>
                <div className='min-sm:hidden md:flex flex-row w-full justify-between'>
                    <div className='flex flex-col gap-4'>
                        <h1 className='font-extrabold tracking-wider text-[#373e68]'>
                            <Link href={`/feedback/redirect?id=${props.id}`}>
                                {props.title}
                            </Link>
                        </h1>
                        <p className='text-[#373e68] tracking-wide'>
                            {props.reason}
                        </p>
                        <div className='bg-[#f2f4ff] flex justify-center items-center w-32 transition duration-200 rounded-xl py-2 px-3 font-semibold text-sm tracking-wider text-blue-500'>
                            {props.tag}
                        </div>
                    </div>
                    <div className='hidden md:flex flex-row items-center gap-2'>
                        <BsFillChatFill className='text-[#cdd2ef]' />
                        <h3 className='font-bold tracking-wider text-[#373e68]'>
                            {props.post_comments_length}
                        </h3>
                    </div>
                </div>
            </div>
            <footer className='flex flex-row items-center justify-between mt-5'>
                <button
                    onClick={(e) => handleUpvoteClick(e)}
                    className='z-10 md:hidden bg-[#f2f4ff] gap-2 flex justify-center items-center w-16 cursor-pointer transition duration-200 rounded-xl py-2 px-3 font-semibold text-sm tracking-wider'
                >
                    <BiSolidChevronUp className='text-2xl text-blue-500' />
                    <h3 className='font-bold tracking-wider text-[#373e68]'>
                        {props.upvotes_count}
                    </h3>
                </button>
                <div className='flex md:hidden flex-row items-center gap-2'>
                    <BsFillChatFill className='text-[#cdd2ef]' />
                    <h3 className='font-bold tracking-wider text-[#373e68]'>
                        {props.post_comments_length}
                    </h3>
                </div>
            </footer>
        </article>
    );
}
