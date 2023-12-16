import { Carousel } from "@mantine/carousel";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const QuestImages: React.FC = () => {
    const [questImages, setQuestImages] = useState<
        { name: string; image: string }[]
    >([]);
    // const questImageJSON = "/QuestImageList.json";
    const qpname = useLocation();
    const { questName } = qpname.state;
    useEffect(() => {
        const fetchQuestImages = async () => {
            try {
                const response = await fetch("./../../QuestImageList.json");
                const imageList = await response.json();

                if (!Array.isArray(imageList)) {
                    console.error("QuestImageList.json is not an array.");
                    return;
                }

                const questInfo = imageList.find(
                    (quest: any) =>
                        quest.name.toLowerCase() === questName.toLowerCase()
                );

                if (!questInfo) {
                    console.error(
                        `Quest with name '${questName}' not found in QuestImageList.json.`
                    );
                    return;
                }

                const filteredImages = questInfo.images || [];

                console.log("Fetched Image List:", imageList);
                console.log("Current questName:", questName);
                console.log("Filtered Images:", filteredImages);

                setQuestImages(filteredImages);
                console.log("Set Quest Images:", filteredImages);
            } catch (error) {
                console.error(
                    "Error fetching or processing QuestImageList.json:",
                    error
                );
            }
        };
        fetchQuestImages();
    }, [questName]);

    return (
        <>
            <Carousel
                className="caroContainer"
                speed={100}
                align="start"
                maw={410}
                mx="auto"
                withIndicators
                slidesToScroll={1}
                height={400}
                styles={{}}
                nextControlIcon={<IconArrowRight size={16} />}
                previousControlIcon={<IconArrowLeft size={16} />}
            >
                {questImages.map((value, index) => (
                    <Carousel.Slide key={index}>
                        <img src={value.image} alt={value.name} />
                    </Carousel.Slide>
                ))}
            </Carousel>
        </>
    );
};

export default QuestImages;
