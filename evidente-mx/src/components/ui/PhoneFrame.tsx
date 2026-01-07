import { ReactNode } from 'react';

interface PhoneFrameProps {
    children: ReactNode;
    className?: string;
}

export function PhoneFrame({ children, className = '' }: PhoneFrameProps) {
    return (
        <div className={`relative mx-auto border-gray-800 bg-gray-800 border-[6px] rounded-[2rem] h-[520px] w-[290px] xl:h-[450px] xl:w-[250px] shadow-xl ${className}`}>
            {/* Notch */}
            <div className="w-[80px] h-[20px] bg-gray-800 absolute -top-1 left-1/2 -translate-x-1/2 rounded-b-lg z-20"></div>

            {/* Side buttons */}
            <div className="h-[36px] w-[2px] bg-gray-800 absolute -left-[8px] top-[90px] rounded-l-md"></div>
            <div className="h-[36px] w-[2px] bg-gray-800 absolute -left-[8px] top-[140px] rounded-l-md"></div>
            <div className="h-[50px] w-[2px] bg-gray-800 absolute -right-[8px] top-[120px] rounded-r-md"></div>

            {/* Screen container */}
            <div className="rounded-[1.7rem] overflow-hidden w-full h-full bg-black relative">
                {children}
            </div>
        </div>
    );
}
