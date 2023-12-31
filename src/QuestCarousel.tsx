// QuestCarousel.tsx
import React, { useState, useEffect } from "react";
import { Carousel } from "@mantine/carousel";
import { TextInput } from "@mantine/core";

import "./index.css";
import { NavLink } from "react-router-dom";
import { IconArrowRight, IconArrowLeft } from "@tabler/icons-react";

const QuestCarousel: React.FC = () => {
    const [questList, setQuestList] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const QUEST_FILE_PATH = "./questlist.txt";
    const [, setSelectedQuest] = useState<string | null>(null);

    useEffect(() => {
        fetchQuestList();
    }, []);

    const fetchQuestList = async () => {
        try {
            const response = await fetch(QUEST_FILE_PATH);
            const text = await response.text();
            const quests = text.split("`");
            quests.sort((a, b) => {
                return a
                    .trim()
                    .replace("'", "")
                    .replace(":", "")
                    .localeCompare(b.trim());
            });
            setQuestList(quests);
        } catch (error) {
            console.error("Error fetching quest list:", error);
        }
    };

    const handleQuestSelection = (selectedQuest: string) => {
        setSelectedQuest(selectedQuest);
    };

    const filteredQuests = questList.filter((quest) =>
        quest.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="customContainer">
                <TextInput
                    className="customInput"
                    label="Search for Quest"
                    placeholder="Type in a quest"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                />
            </div>

            <div>
                <Carousel
                    className="caroContainer"
                    speed={100}
                    align="start"
                    mx="auto"
                    withIndicators
                    slidesToScroll={1}
                    height={400}
                    nextControlIcon={<IconArrowRight size={16} />}
                    previousControlIcon={<IconArrowLeft size={16} />}
                    slideSize="100%"
                >
                    {filteredQuests.map((quest, index) => {
                        if (quest) {
                            let questTEdit = quest.toLowerCase().split(" ");
                            let modifiedQuestVal1 = questTEdit
                                .join("")
                                .replace(/[!,`']/g, "");

                            const pattern = /[^a-zA-Z0-9]/g;

                            let questImage =
                                "./Rewards/" +
                                quest.toLowerCase().replace(pattern, "") +
                                "reward.png";

                            return (
                                <Carousel.Slide
                                    key={index}
                                    onClick={() => handleQuestSelection(quest)}
                                >
                                    <div
                                        className="caroQTitle"
                                        aria-label={`Navigate to ${quest}`}
                                    >
                                        <NavLink
                                            className="navLink"
                                            to={"/QuestPage"}
                                            state={{
                                                questName: quest,
                                                modified: modifiedQuestVal1,
                                            }}
                                        >
                                            {quest}
                                            <img
                                                src={questImage}
                                                alt="Reward"
                                                aria-hidden="true"
                                            />
                                        </NavLink>
                                    </div>
                                </Carousel.Slide>
                            );
                        }
                    })}
                </Carousel>
            </div>
        </>
    );
};

export default QuestCarousel;
