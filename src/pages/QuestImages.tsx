import { Carousel } from "@mantine/carousel";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const QuestImages: React.FC = () => {
    const [questImages, setQuestImages] = useState<
        { name: string; image: string }[]
    >([]);
    const questImageJSON = "/QuestImageList.json";

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await fetch(questImageJSON);
                const images = await response.json();
                setQuestImages(images); // Assuming the JSON structure is an array of objects with 'name' and 'image' keys
            } catch (error) {
                console.error("Error fetching images:", error);
            }
        };

        fetchImages();
    }, [questImageJSON]);

    return (
        <>
            <Carousel
                className="caroContainer"
                breakpoints={[
                    { maxWidth: "sm", slideSize: "10%", slideGap: 0 },
                    { maxWidth: "md", slideSize: "50%", slideGap: 4 },
                    { maxWidth: "lg", slideSize: "75%", slideGap: 8 },
                    { maxWidth: "xl", slideSize: "100%", slideGap: 10 },
                ]}
                speed={100}
                align="start"
                maw={410}
                mx="auto"
                withIndicators
                slidesToScroll={1}
                height={400}
                styles={{
                    control: {
                        "&[data-inactive]": {
                            opacity: 0,
                            cursor: "default",
                        },
                    },
                }}
                nextControlIcon={<IconArrowRight size={16} />}
                previousControlIcon={<IconArrowLeft size={16} />}
            >
                {questImages.map((value, index) => (
                    <Carousel.Slide size={100} key={index}>
                        <img src={value.image} alt={value.name} />
                    </Carousel.Slide>
                ))}
            </Carousel>
        </>
    );
};

export default QuestImages;
