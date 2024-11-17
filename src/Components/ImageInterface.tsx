interface ImageProps {
	src: string;
	alt?: string;
	className?: string;
	width?: string | number;
	height?: string | number;
}
export const Image: React.FC<ImageProps> = ({
	src,
	alt,
	className,
	width,
	height,
}) => {
	return (
		<img
			src={src}
			alt={alt || "Image"}
			className={className}
			width={width}
			height={height}
		/>
	);
};
