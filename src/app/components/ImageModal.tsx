type TImageModalProps = {
    image_src: string;
};

export default function ImageModal({ image_src }: TImageModalProps) {
    return (
        <article className='hidden md:block w-full h-auto'>
            <img
                src={image_src}
                alt=''
                className='object-cover rounded shadow-xl'
            />
        </article>
    );
}
