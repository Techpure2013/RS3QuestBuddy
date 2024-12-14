import React from "react";
interface FontSizeContextType {
    fontSize: number;
    setFontSize: (size: number) => void;
}
export declare const FontSizeProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useFontSize: () => FontSizeContextType;
export {};
