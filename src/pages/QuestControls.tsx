import React, { useState, useEffect } from "react";
import {
    Button,
    Flex,
    ButtonProps,
    createPolymorphicComponent,
} from "@mantine/core";
import styled from "@emotion/styled";

const QuestControls: React.FC<{
    scrollNext: () => void;
    scrollPrev: () => void;
    handleStepChange: (nextStep: number) => void; // Add handleStepChange prop
}> = ({ scrollNext, scrollPrev, handleStepChange }) => {
    const [active, setActive] = useState(0);
    const _StyledButton = styled(Button)`
        border-width: 0.125rem;
        color: white;
    `;

    const StyledButton = createPolymorphicComponent<"button", ButtonProps>(
        _StyledButton
    );

    const handleScrollNext = () => {
        const nextStep = active + 1;
        setActive(nextStep);
        handleStepChange(nextStep); // Call handleStepChange with the updated step
        scrollNext();
        scrollIntoView(nextStep);
    };

    const handleScrollPrev = () => {
        const nextStep = active - 1;
        setActive(nextStep);
        handleStepChange(nextStep); // Call handleStepChange with the updated step
        scrollPrev();
        scrollIntoView(nextStep);
    };
    const scrollIntoView = (step: number) => {
        const element = document.getElementById(step.toString());
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };
    useEffect(() => {
        console.log("QuestControls component initialized");
    }, []);

    return (
        <>
            <Flex className="ButtonGroupTwo" gap="sm">
                <StyledButton variant="outline" onClick={handleScrollPrev}>
                    Prev Step
                </StyledButton>
                <StyledButton variant="outline" onClick={handleScrollNext}>
                    Next Step
                </StyledButton>
            </Flex>
        </>
    );
};

export default QuestControls;
