export default function FeedbackCardLoading() {
    return (
        <article
            role='status'
            className='animate-pulse bg-white rounded md:rounded-xl py-6 px-5 w-80 md:w-full md:border transition duration-150'
        >
            <div className='flex flex-row gap-5'>
                <div className='md:block'>
                    <button className='hidden h-20 border z-10 bg-[#f2f4ff] gap-1 md:flex flex-col justify-center items-center w-16 cursor-default rounded-xl py-2 px-3 font-semibold text-sm tracking-wider'></button>
                </div>
                <div className='min-sm:hidden md:flex flex-row w-full justify-between'>
                    <div className='flex flex-col'>
                        <div className='h-4 bg-[#f2f4ff] rounded-full w-36 md:w-72 mb-2 border'></div>
                        <div className='h-2.5 bg-[#f2f4ff] rounded-full w-40 md:w-80 mb-4 border'></div>
                        <div className='h-10 bg-[#f2f4ff] rounded-full w-48 md:w-96 mb-7 border'></div>
                        <div className='h-3 bg-[#f2f4ff] rounded-full w-28 md:w-48 border'></div>
                    </div>
                </div>
            </div>
        </article>
    );
}
