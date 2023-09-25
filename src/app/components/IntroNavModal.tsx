export default function IntroNavModal() {
    return (
        <div className='shadow-xl w-full rounded-full px-5 py-3 flex flex-row items-center bg-gradient-to-l from-rose-400 via-fuchsia-500 to-indigo-500'>
            <h1 className='text-white font-semibold tracking-wide'>
                Made with <span className='text-red-600 text-2xl'>♥</span> by{" "}
                <span className='hover:underline cursor-pointer'>Waffen</span>.
            </h1>
        </div>
    );
}
