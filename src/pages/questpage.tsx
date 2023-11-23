import { Button, Group, Stepper } from "@mantine/core";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const QuestPage: React.FC = () => {
    const qpname = useLocation();
    const { questName, modified } = qpname.state;
    const [stepPath, setStepPath] = useState<string>("");
    const [stepDetails, setStepDetails] = useState<string[]>([]);
    const questStepJSON = "/questlist.json";
    const textfile = modified + "info.txt";
    const [active, setActive] = useState(1);
    const [highestStepVisited, setHighestStepVisited] = useState(active);
    const stepLength = stepDetails.length;
    const handleStepChange = (nextStep: number) => {
        const isOutOfBounds = nextStep > stepLength || stepLength < 0;

        if (isOutOfBounds) {
            return console.log("out of bounds");
        }

        setActive(nextStep);
        setHighestStepVisited((hSC) => Math.max(hSC, nextStep));
    };

    // Allow the user to freely go back and forth between visited steps.
    const shouldAllowSelectStep = (step: number) =>
        highestStepVisited >= step && active !== step;
    useEffect(() => {
        fetchStepPath();
    }, []);

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
                setStepPath(foundStep.Path);
            } else {
                console.error(
                    "Step not found for textfile:",
                    normalizedTextFile
                );
            }
        } catch (error) {
            console.error("Error fetching or processing quest list:", error);
        }
    };
    const fetchStep = async () => {
        try {
            const response = fetch(stepPath);
            const text = (await response).text();
            const textSteps = (await text).split("`");
            setStepDetails(textSteps);
        } catch (error) {
            console.error("Steps Could Not Load", error);
        }
    };

    useEffect(() => {
        fetchStep();
    }, [fetchStep()]);

    return (
        <>
            <div>
                <h2>{questName}</h2>
            </div>
            <div>
                <Group position="center" mt="md">
                    <Button
                        variant="outline"
                        onClick={() => handleStepChange(active - 1)}
                    >
                        Back
                    </Button>
                    <Button onClick={() => handleStepChange(active + 1)}>
                        Next step
                    </Button>
                </Group>
                <Stepper
                    active={active}
                    onStepClick={setActive}
                    breakpoint="xl"
                >
                    {stepDetails.map((value, index) => {
                        return (
                            <Stepper.Step
                                label={"Step: " + (index + 1)}
                                key={index}
                                orientation="vertical"
                                description={value}
                                allowStepSelect={shouldAllowSelectStep(0)}
                            ></Stepper.Step>
                        );
                    })}
                </Stepper>
            </div>
        </>
    );
};

export default QuestPage;
