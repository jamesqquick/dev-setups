import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Transformation, Image } from 'cloudinary-react';
import ImagePreview from './ImagePreview';
import { useAlert } from 'react-alert';
import MyModal from './MyModal';

export default function UserImageUpload({ existingImageId }) {
    const [imageDataUrl, setImageDataUrl] = useState('');
    const alert = useAlert();

    const onDrop = useCallback(
        (acceptedFiles) => {
            const file = acceptedFiles[0];
            const fsize = Math.round(file.size / 1024); //file size in kb
            if (fsize >= 3096) {
                alert.show(
                    'File size too big. Please upload a file under 3Mb.',
                    {
                        type: 'danger',
                    }
                );
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setImageDataUrl(reader.result);
            };
            reader.onerror = () => {
                console.error('AHHHHHHHH!!');
            };
        },
        [alert]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: ['image/png', 'image/jpg', 'image/jpeg'],
    });

    return (
        <div className="flex justify-center mb-5">
            <MyModal
                isOpen={!!imageDataUrl}
                contentLabel="Upload Profile Image"
            >
                <ImagePreview
                    closeModal={() => setImageDataUrl(null)}
                    imageDataUrl={imageDataUrl}
                />
            </MyModal>
            <div {...getRootProps()} className="relative">
                {
                    <Image
                        cloudName={
                            process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                        }
                        publicId={
                            existingImageId ||
                            'dev_setups/placeholder-image_vcbif2'
                        }
                        className="rounded-md shadow-lg"
                    >
                        <Transformation crop="fill" />
                    </Image>
                }
                <div className="absolute flex items-center justify-center top-0 right-0 bottom-0 left-0 opacity-0 hover:opacity-100 bg-gray-200 bg-opacity-75 text-2xl transition-opacity duration-200 cursor-pointer">
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p>Drop the file here ...</p>
                    ) : (
                        <p>Drag 'n' drop an image, or click to select one.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
