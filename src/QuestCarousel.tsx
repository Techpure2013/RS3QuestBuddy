// QuestCarousel.tsx
import React, { useState, useEffect } from "react";
import { Carousel } from "@mantine/carousel";
import { TextInput } from "@mantine/core";
import "./index.css";
import { NavLink } from "react-router-dom";

const QUEST_FILE_PATH = "RS3QuestBuddy/" + "Quests/questlist.txt";

const QuestCarousel: React.FC = () => {
    const [questList, setQuestList] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    //const overlayDuration = 10000; // 10 seconds

    useEffect(() => {
        fetchQuestList();
    }, []);

    const fetchQuestList = async () => {
        try {
            const response = await fetch(QUEST_FILE_PATH);
            const text = await response.text();
            const quests = text.split(",");
            setQuestList(quests);
            console.log(quests);
        } catch (error) {
            console.error("Error fetching quest list:", error);
        }
    };

    const filteredQuests = questList.filter((quest) =>
        quest.toLowerCase().includes(searchQuery.toLowerCase())
    );
    function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchQuery(event.target.value);
    }
    return (
        <>
            <div>
                <TextInput
                    label="Search for Quest"
                    placeholder="Type in a quest"
                    size="md"
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="carousel-container">
                <Carousel maw={320} mx="auto" withIndicators height={200}>
                    {filteredQuests.map((quest, index) => {
                        let questTEdit = quest.toLowerCase().split(" ");
                        let pattern = /[!,`']/g;
                        let modifiedQuestVal1 = questTEdit
                            .join("")
                            .replace(pattern, "");

                        return (
                            <Carousel.Slide key={index}>
                                <NavLink
                                    to={"/QuestPage"}
                                    state={{
                                        questName: quest,
                                        modified: modifiedQuestVal1,
                                    }}
                                >
                                    {quest}
                                </NavLink>
                            </Carousel.Slide>
                        );
                    })}
                </Carousel>
            </div>
        </>
    );
};

export default QuestCarousel;
