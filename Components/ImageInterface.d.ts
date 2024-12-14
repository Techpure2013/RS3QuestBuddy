/// <reference types="react" />
interface ImageProps {
    src: string;
    alt?: string;
    className?: string;
    width?: string | number;
    height?: string | number;
}
export declare const Image: React.FC<ImageProps>;
export {};
