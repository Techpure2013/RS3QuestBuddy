import { Button, Flex, Stepper } from "@mantine/core";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "./../index.css";
const QuestPage: React.FC = () => {
    const qpname = useLocation();
    const { questName, modified } = qpname.state;
    const [stepDetails, setStepDetails] = useState<string[]>([]);
    const questStepJSON = "./QuestList.json";
    const textfile = modified + "info.txt";
    const [active, setActive] = useState(0);
    const [highestStepVisited, setHighestStepVisited] = useState(active);
    const stepLength = stepDetails.length;
    const navigate = useNavigate();

    const scrollNext = () => {
        if (active >= 1) {
            document
                .getElementById(active.toString())
                ?.scrollIntoView({ behavior: "smooth" });
        }
    };
    const scrollPrev = () => {
        document
            .getElementById(active.toString())
            ?.scrollIntoView({ behavior: "smooth" });
    };

    const handleStepChange = (nextStep: number) => {
        const isOutOfBoundsBottom = nextStep > stepLength;
        const isOutOfBoundsTop = stepLength < 0;

        if (isOutOfBoundsBottom) {
            return window.alert("Cannot go forward");
        } else if (isOutOfBoundsTop) {
            return window.alert("Cannot go back");
        } else {
            setActive(nextStep);
            setHighestStepVisited((hSC) => Math.max(hSC, nextStep));
        }
    };
    const handleBackButton = () => {
        navigate("/");
    };
    // Allow the user to freely go back and forth between visited steps.
    const shouldAllowSelectStep = (step: number) =>
        highestStepVisited >= step && active !== step;
    useEffect(() => {
        const fetchStepPath = async () => {
            try {
                const response = await fetch(questStepJSON);
                const file = await response.json();

                const normalizedTextFile = textfile
                    .toLowerCase()
                    .replace(/\s+/g, "");

                const foundStep = file.find((value: { Quest: string }) => {
                    let pattern = /[!,`']/g;
                    const normalizedValue =
                        value.Quest.toLowerCase()
                            .split(" ")
                            .join("")
                            .replace(pattern, "") + "info.txt";

                    return normalizedValue === normalizedTextFile;
                });

                if (foundStep) {
                    return foundStep.Path;
                } else {
                    console.error(
                        "Step not found for textfile:",
                        normalizedTextFile
                    );
                    return null;
                }
            } catch (error) {
                console.error(
                    "Error fetching or processing quest list:",
                    error
                );
                return null;
            }
        };

        const fetchData = async () => {
            try {
                const stepPath = await fetchStepPath();
                if (stepPath) {
                    const response = await fetch(stepPath);
                    const text = await response.text();
                    const textSteps = text.split("`");
                    setStepDetails(textSteps);
                }
            } catch (error) {
                console.error("Steps Could Not Load", error);
            }
        };

        fetchData();
    }, [textfile, questStepJSON]);

    return (
        <>
            <div>
                <h2 className="qpTitle">{questName}</h2>
            </div>

            <Flex className="prevNextGroup" gap="sm">
                <Button
                    variant="outline"
                    onClick={() => {
                        scrollPrev();
                        handleStepChange(active - 2);
                    }}
                >
                    Prev Step
                </Button>
                <Button
                    variant="outline"
                    onClick={() => {
                        handleStepChange(active + 1);
                        scrollNext();
                    }}
                >
                    Next Step
                </Button>
            </Flex>
            <Flex
                className="buttonsGroup"
                gap="sm"
                justify="flex-start"
                align="flex-start"
                direction="column"
                wrap="wrap"
            >
                <Button variant="outline">
                    Related Quest Images(Coming Soon)
                </Button>
                <Button variant="outline" onClick={handleBackButton}>
                    Pick Quest
                </Button>
            </Flex>

            <Stepper
                className="stepperContainer"
                active={active}
                onStepClick={setActive}
                breakpoint="xl"
            >
                {stepDetails.map((value, index) => {
                    return (
                        <Stepper.Step
                            id={index.toString()}
                            className="stepperStep"
                            label={"Step: " + (index + 1)}
                            key={index}
                            orientation="vertical"
                            description={value}
                            allowStepSelect={shouldAllowSelectStep(0)}
                        ></Stepper.Step>
                    );
                })}
            </Stepper>
        </>
    );
};

export default QuestPage;
