// QuestPage.js
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Accordion,
    Button,
    Flex,
    List,
    // ListItem,
    MantineProvider,
    Stepper,
    // Text,
} from "@mantine/core";
import * as a1lib from "alt1";
import DialogReader from "alt1/dialog";
import QuestControls from "./QuestControls";
import "./../index.css";

import QuestDetails from "./QuestDetail.json";
import { Carousel } from "@mantine/carousel";
import { createRoot } from "react-dom/client";
import "@mantine/core/styles/global.css";
import "@mantine/core/styles/ScrollArea.css";
import "@mantine/core/styles/UnstyledButton.css";
import "@mantine/core/styles/VisuallyHidden.css";
import "@mantine/core/styles/Paper.css";
import "@mantine/core/styles/Popover.css";
import "@mantine/core/styles/CloseButton.css";
import "@mantine/core/styles/Group.css";
import "@mantine/core/styles/Loader.css";
import "@mantine/core/styles/Overlay.css";
import "@mantine/core/styles/Accordion.css";
import "@mantine/core/styles/Input.css";
import "@mantine/core/styles/Flex.css";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import {
    // getPriority,
    // updatePriorityCounters,
    // ResetPSystem,
    // getTitle,
    QuestDetail,
    Image,
} from "./prioritysystem";

// import questimages from "./QuestImages";
const QuestPage: React.FC = () => {
    // State and variables
    const qpname = useLocation();
    const { questName, modified } = qpname.state;
    const [stepDetails, setStepDetails] = useState<string[]>([]);
    const questStepJSON = "./QuestList.json";
    const textfile = modified + "info.txt";
    const [active, setActive] = useState(0);
    const [highestStepVisited, setHighestStepVisited] = useState(active);
    const [buttonVisible, setButtonVisible] = useState(true);
    const navigate = useNavigate();
    const [popOutWindow, setPopOutWindow] = useState<Window | null>(null);
    const [, setPopOutClicked] = useState(false);
    const [questImages, setQuestImages] = useState<string[]>([]);
    const [viewQuestImage, setViewQuestImage] = useState(false);
    const [, setTranscript] = useState<string>("");
    const [cTranscript, setCTranscript] = useState<string[]>([]);
    const color = a1lib.mixColor(255, 0, 0);
    const [, setCurrentDialog] = useState<string[]>([]);
    const stepRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
    const [boxX, setboxX] = useState(0);
    const [boxY, setBoxY] = useState(0);

    // const [boxX, setboxX] = useState("");
    // const [boxY, setBoxY] = useState("");
    const [diagW, setDiagW] = useState(0);
    const [diagH, setDiagH] = useState(0);
    const [diagTitle, setDiagTitle] = useState("");
    const [revealAccordian, setRevealAccordian] = useState(false);
    const [, setQuestRequirements] = useState<string[]>([]);
    const [, setItemsNeeded] = useState<string[]>([]);
    const [, setMembersOrNot] = useState("");
    const [, setOfficialLength] = useState("");
    const [, setRecommended] = useState<string[]>([]);
    const [, setEnemiesToDefeat] = useState<string[]>([]);
    const [, setStartPoint] = useState("");
    const [, setQuestDetailsQuest] = useState<string[]>([]);
    const [questDetailsInfo, setQuestDetailsInfo] =
        useState<QuestDetail | null>(null);
    // const diagReader = new DialogReader();
    // const [activeItem, setActiveItem] = useState(null);
    // Effect for initializing stepRefs
    // Fetches the path for the current step
    useEffect(() => {
        const fetchQuestDetails = () => {
            try {
                const stringyJson = JSON.stringify(QuestDetails);

                // Fetch the quest details from the JSON file
                const data = JSON.parse(stringyJson);

                // Check for successful response

                // Function to sanitize string
                const sanitizeString = (input: string) => {
                    return input.replace(/[^\w\s]/gi, "").toLowerCase();
                };

                // Sanitize and trim the quest name
                const sanitizedQuestName = sanitizeString(questName.trim());

                // Find the quest info based on the sanitized quest name
                const questInfo = data.find((quest: { Quest: string }) => {
                    return (
                        quest.Quest &&
                        sanitizeString(quest.Quest) === sanitizedQuestName
                    );
                });

                // Handle case when quest info is not found
                if (!questInfo) {
                    console.warn(
                        `Quest Details not found for questName: ${questName}`
                    );
                    return;
                } else {
                    setQuestDetailsQuest(questInfo["Quest"]);
                    setStartPoint(questInfo["StartPoint"]);
                    setEnemiesToDefeat(questInfo["EnemiesToDefeat"]);
                    setQuestRequirements(questInfo["Requirements"]);
                    setMembersOrNot(questInfo["MemberRequirement"]);
                    setItemsNeeded(questInfo["ItemsRequired"]);
                    setOfficialLength(questInfo["OfficialLength"]);
                    setRecommended(questInfo["Recommended"]);
                    setQuestDetailsInfo(questInfo);
                }
            } catch (error) {
                // Log the error details
                console.warn("Could not fetch quest details", error);
            }
        };

        fetchQuestDetails();
    }, []);

    useEffect(() => {
        const fetchQuestImages = async () => {
            try {
                const response = await fetch("./QuestImageList.json");
                const imageList = await response.json();

                if (!Array.isArray(imageList)) {
                    console.error("QuestImageList.json is not an array.");
                    return;
                }

                const sanitizeString = (input: string) => {
                    return input.replace(/[^\w\s]/gi, "").toLowerCase();
                };

                const sanitizedQuestName = questName.trim();
                const questInfo = imageList.find(
                    (quest: any) =>
                        quest.name &&
                        sanitizeString(quest.name) ===
                            sanitizeString(sanitizedQuestName)
                );

                if (!questInfo) {
                    console.error(
                        `Quest info not found for questName: ${questName}`
                    );
                    return;
                }

                const filteredImages = questInfo.images;

                if (!Array.isArray(filteredImages)) {
                    console.error(
                        `Images array not found for questName: ${questName}`
                    );
                    return;
                }

                const imagePaths =
                    filteredImages.length === 1
                        ? [
                              `./Images/${questName.trim()}/${filteredImages[0].trim()}`,
                          ]
                        : filteredImages
                              .filter((filename: string) =>
                                  filename.toLowerCase().endsWith(".png")
                              )
                              .map(
                                  (filename: string) =>
                                      `./Images/${questName.trim()}/${filename.trim()}`
                              );

                setQuestImages(imagePaths);
            } catch (error) {
                console.error(
                    "Error fetching or processing QuestImageList.json:",
                    error
                );
            }
        };
        const fetchStepPath = async () => {
            try {
                const response = await fetch(questStepJSON);
                const file = await response.json();
                const pattern = /[!,`']/g;
                const normalizedTextFile = textfile
                    .toLowerCase()
                    .replace(/\s+/g, "");

                const foundStep = file.find((value: { Quest: string }) => {
                    const normalizedValue =
                        value.Quest.toLowerCase()
                            .split(" ")
                            .join("")
                            .replace(pattern, "")
                            .replace("-", "") + "info.txt";

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
        const fetchQuestTranscripts = async () => {
            try {
                const response = await fetch(questStepJSON);
                const questData = await response.json();

                // Find the quest entry in the questData array
                const questNameToFind = questName.toLowerCase().trim();
                const questEntry = questData.find(
                    (value: { Quest: string }) => {
                        const normalizedQuestName =
                            value.Quest.toLowerCase().trim();

                        return normalizedQuestName === questNameToFind;
                    }
                );

                if (questEntry) {
                    // Fetch the transcripts only if the quest entry is found
                    const transcriptPath = questEntry.Transcript;
                    const cTranscriptPath = questEntry.CTranscript;

                    // Fetch main quest transcript as text
                    const transcriptResponse = await fetch(transcriptPath);
                    const mainQuestTranscript = await transcriptResponse.text();

                    // Fetch compare quest transcript as text
                    const cTranscriptResponse = await fetch(cTranscriptPath);
                    const compareQuestTranscript =
                        await cTranscriptResponse.json();

                    // Set the transcripts in your state variables or perform other actions
                    setTranscript(mainQuestTranscript);
                    setCTranscript(compareQuestTranscript.Compare);
                } else {
                    console.error("Quest not found:", questNameToFind);
                }
            } catch (error) {
                console.error(
                    "Error fetching or processing quest transcripts:",
                    error
                );
            }
        };
        fetchQuestTranscripts();

        fetchQuestImages();
        fetchData();
    }, [textfile, questStepJSON, questName]);
    useEffect(() => {
        stepRefs.current = Array.from({ length: stepDetails.length }, () =>
            React.createRef()
        );
    }, [stepDetails.length]);

    // const findDialogBox = () => {
    //     const found = diagReader.find();
    //     console.log("DiagReader find result:", found);

    //     if (found) {
    //         if (!null) {
    //             setDiagH(diagReader.pos?.height!);
    //             setDiagW(diagReader.pos?.width!);

    //             const diagboxcapture = a1lib.captureHoldFullRs();

    //             const checked = diagReader.checkDialog(diagboxcapture);
    //             console.log("Dialog checked:", checked);

    //             let title = diagReader.readTitle(diagboxcapture);
    //             setDiagTitle(title);
    //             console.log("Read dialog title:", title);
    //             getTitle(title);
    //             if (checked) {
    //                 try {
    //                     const dialog = diagReader.readDialog(
    //                         diagboxcapture,
    //                         checked
    //                     ) as string[];
    //                     setCurrentDialog(dialog);
    //                 } catch (error) {
    //                     console.error("Error reading dialog:", error);
    //                 }
    //             }

    //             const findOptions = diagReader.findOptions(diagboxcapture);

    //             const readOption = diagReader.readOptions(
    //                 diagboxcapture,
    //                 findOptions
    //             );

    //             if (readOption) {
    //                 for (let i = 0; i < readOption.length; i++) {
    //                     const option = readOption[i].text;
    //                     console.log("Processing option:", option);

    //                     const priority = getPriority(option, cTranscript);
    //                     console.log("Priority for option:", priority);

    //                     updatePriorityCounters(cTranscript);

    //                     if (priority.includes("high")) {
    //                         console.log("High priority option found:", option);
    //                         let readOptionX = readOption[i].x.toString();
    //                         let readOptionY = readOption[i].y.toString();
    //                         setboxX(readOptionX);
    //                         setBoxY(readOptionY);
    //                         break;
    //                     }
    //                 }
    //             }
    //         } else {
    //             console.error("diagReader.pos is null or undefined");
    //         }
    //     } else {
    //         setDiagH(0);
    //         setDiagW(0);
    //         setDiagTitle("");
    //         ResetPSystem();
    //         // console.warn(
    //         //     "Invalid dialog box coordinates, resetting coordinates"
    //         // );
    //     }
    // };
    // // UseEffect to find the dialog box
    // useEffect(() => {
    //     const intervalID = setInterval(findDialogBox, 2000);
    //     // Clean up the interval when the component is unmounted
    //     return () => {
    //         clearInterval(intervalID);
    //     };
    // }, []);
    // useEffect(() => {
    //     if (
    //         diagTitle.toLowerCase() == "choose an option" ||
    //         diagTitle.toLowerCase() == "select an option" ||
    //         diagTitle.toLowerCase() == "ask about which band member?" ||
    //         diagTitle.toLowerCase() == "what do you see?" ||
    //         diagTitle.toLowerCase() == "knowing see, knowing do" ||
    //         diagTitle.toLowerCase() == "what do you want to ask daya" ||
    //         diagTitle.toLowerCase() == "ask gully about..."
    //     ) {
    //         console.log("Setting box around", boxX, boxY);

    //         alt1.overLayRect(
    //             color,
    //             parseInt(boxX) - 50,
    //             parseInt(boxY) - 13,
    //             diagW / 2 - 100,
    //             diagH / 2 - 35,
    //             3000,
    //             3
    //         );
    //     }
    // }, [boxX, boxY]);
    // UseEffect to find the dialog box
    useEffect(() => {
        const diagReader = new DialogReader();

        const findDialogBox = () => {
            const found = diagReader.find();
            setDiagH(diagReader.pos?.height!);
            setDiagW(diagReader.pos?.width!);
            if (found) {
                if (!null) {
                    const diagboxcapture = a1lib.captureHoldFullRs();

                    const findOptions = diagReader.findOptions(diagboxcapture);

                    const readOption = diagReader.readOptions(
                        diagboxcapture,
                        findOptions
                    );

                    if (readOption) {
                        for (let i = 0; i < readOption.length; i++) {
                            const option = readOption[i].text;

                            if (
                                cTranscript.includes(option) ||
                                cTranscript.includes("[Any Option]")
                            ) {
                                setboxX(readOption[i].x);
                                setBoxY(readOption[i].y);
                                break; // Exit the loop once a match is found
                            }
                        }
                    }

                    const checked = diagReader.checkDialog(diagboxcapture);
                    let title = diagReader.readTitle(diagboxcapture);
                    if (checked) {
                        try {
                            const dialog = diagReader.readDialog(
                                diagboxcapture,
                                checked
                            ) as string[];
                            setCurrentDialog(dialog);
                        } catch (error) {}
                    }

                    setDiagTitle(title);
                    console.log(title);
                } else {
                    console.error("diagReader.pos is null or undefined");
                }
            } else {
                console.error("Invalid dialog box coordinates");
            }
        };

        // Set up an interval to periodically check for the dialog box
        const intervalId = setInterval(findDialogBox, 1000); // Adjust the interval as needed

        // Clean up the interval when the component is unmounted
        return () => {
            setDiagTitle("");
            clearInterval(intervalId);
        };
    }, [diagTitle]);
    if (
        diagTitle.toLowerCase() == "choose an option" ||
        diagTitle.toLowerCase() == "select an option"
    ) {
        alt1.overLayRect(
            color,
            boxX - 50,
            boxY - 16,
            diagW / 2 - 50,
            diagH / 2 - 30,
            500,
            4
        );
    } else {
        null;
    }
    // Handles Image Enlargement

    // Handles popping in and out the quest controls
    const handlePopOut = () => {
        if (popOutWindow && !popOutWindow.closed) {
            // If open, close the window
            popOutWindow.close();
            setPopOutWindow(null);
            setButtonVisible(true); // Show the buttons again
            setPopOutClicked(true);
        } else {
            // If not open, open a new browser window
            const newWindow = window.open("", "", "width=237,height=90");
            if (newWindow) {
                // Set the pop-out window and hide buttons in the current window
                setPopOutWindow(newWindow);
                setButtonVisible(false);
                setPopOutClicked(false);

                // Render the QuestControls component into the new window
                const container: HTMLDivElement =
                    newWindow.document.createElement("div");
                container.className = "ButtonGroupTwo";
                newWindow.document.body.appendChild(container);
                newWindow.document.title = "Quest Controls";

                // Set initial content for the new window
                const initialContentContainer =
                    newWindow.document.createElement("div");
                initialContentContainer.id = "initialContentContainer";
                newWindow.document.body.appendChild(initialContentContainer);
                const domNode: any = newWindow.document.getElementById(
                    "initialContentContainer"
                );
                const root = createRoot(domNode);
                const iconLink = newWindow.document.createElement("link");
                iconLink.rel = "icon";
                iconLink.href = "./src/assets/rs3buddyicon.png";
                newWindow.document.head.appendChild(iconLink);

                // Function to copy styles from the original window to the new window
                function copyStyles(): void {
                    const stylesheets: NodeListOf<
                        HTMLStyleElement | HTMLLinkElement
                    > = document.querySelectorAll(
                        'style, link[rel="stylesheet"]'
                    );
                    const stylesheetsArray: HTMLStyleElement[] =
                        Array.from(stylesheets);

                    console.log("Copying styles:", stylesheetsArray);

                    stylesheetsArray.forEach(function (
                        stylesheet: HTMLStyleElement
                    ) {
                        copyStyle(window, newWindow!, stylesheet);
                    });

                    const emotionStyles = document.querySelectorAll(
                        "style[data-emotion]"
                    );
                    emotionStyles.forEach((style) => {
                        const newEmotionStyle = document.createElement("style");
                        newEmotionStyle.textContent = style.textContent;
                        newWindow!.document.head.appendChild(newEmotionStyle);
                    });
                }

                // Call the function to copy styles
                copyStyles();

                // Render QuestControls into the new window
                root.render(
                    <MantineProvider>
                        <QuestControls
                            scrollNext={scrollNext}
                            scrollPrev={scrollPrev}
                            handleStepChange={setActiveAndScroll}
                        />
                    </MantineProvider>
                );
            }
        }
    };

    // Function to copy styles from one window to another
    function copyStyle(
        _from: Window,
        to: Window,
        node: HTMLStyleElement | HTMLLinkElement
    ): void {
        const doc: Document = to.document;

        if (node.tagName === "STYLE") {
            // If it's a style element, create a new style element
            const newStyle: HTMLStyleElement = doc.createElement("style");

            if (node.textContent) {
                newStyle.textContent = node.textContent;
            } else if ("innerText" in node && node.innerText) {
                newStyle.innerText = node.innerText;
            }

            doc.head.appendChild(newStyle);
        } else if (node.tagName === "LINK" && "rel" in node) {
            // If it's a link element, create a new link element
            const newLink: HTMLLinkElement = doc.createElement("link");

            if ("rel" in node) {
                newLink.rel = node.rel;
            }

            newLink.href = node.href;
            newLink.type = node.type;

            doc.head.appendChild(newLink);
        }
    }
    const HandleShowAccordian = () => {
        setRevealAccordian((prev) => !prev);
    };
    // Sets active step and scrolls into view
    const setActiveAndScroll = (nextStep: number) => {
        if (nextStep >= 0 && nextStep < stepDetails.length) {
            setActive(nextStep);
            setHighestStepVisited((hSC) => Math.max(hSC, nextStep));
            stepRefs.current[nextStep].current?.scrollIntoView({
                behavior: "smooth",
            });
        }
    };
    //Handles image carousel visibility
    const questImageVis = () => {
        setViewQuestImage((prevState) => !prevState);
    };
    // Handles step change
    const handleStepChange = (nextStep: number) => {
        const stepLength = stepDetails.length;
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

    // Scrolls to the next step
    const scrollNext = () => {
        const nextStep = active + 1;
        scrollIntoView(nextStep);
    };

    // Scrolls to the previous step
    const scrollPrev = () => {
        const prevStep = active - 1;
        scrollIntoView(prevStep);
    };

    // Scrolls into view based on step
    const scrollIntoView = (step: number) => {
        const element = document.getElementById(step.toString());
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // Handles going back to the main page
    const handleBackButton = () => {
        navigate("/");
    };

    // Allows the user to freely go back and forth between visited steps
    const shouldAllowSelectStep = (step: number) =>
        highestStepVisited >= step && active !== step;

    // Rendered content
    return (
        <>
            <div>
                <h2 className="qpTitle">{questName}</h2>
            </div>

            {viewQuestImage && (
                <>
                    <Carousel
                        withIndicators
                        orientation="horizontal"
                        align="center"
                        mx="auto"
                        slidesToScroll={1}
                        nextControlIcon={<IconArrowRight size={16} />}
                        previousControlIcon={<IconArrowLeft size={16} />}
                        slideSize="100%"
                    >
                        {questImages.map((src, index) => (
                            <Carousel.Slide key={index}>
                                <img src={src} />
                            </Carousel.Slide>
                        ))}
                    </Carousel>
                </>
            )}
            {buttonVisible && (
                <Flex className="prevNextGroup" gap="sm">
                    <Button
                        variant="outline"
                        color="#EEF3FF"
                        onClick={() => {
                            scrollPrev();
                            handleStepChange(active - 1);
                        }}
                    >
                        Prev Step
                    </Button>
                    <Button
                        variant="outline"
                        color="#EEF3FF"
                        onClick={() => {
                            handleStepChange(active + 1);
                            scrollNext();
                        }}
                    >
                        Next Step
                    </Button>
                </Flex>
            )}
            <Flex
                className=""
                gap="sm"
                justify="flex-start"
                align="flex-start"
                direction="column"
                wrap="wrap"
            >
                {popOutWindow ? (
                    <Button
                        variant="outline"
                        color="#EEF3FF"
                        onClick={handlePopOut}
                    >
                        Pop In Quest Controls
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        color="#EEF3FF"
                        onClick={handlePopOut}
                    >
                        Pop Out Quest Controls
                    </Button>
                )}
                <Button
                    variant="outline"
                    color="#EEF3FF"
                    onClick={handleBackButton}
                >
                    Pick Quest
                </Button>
                <Button
                    variant="outline"
                    color="#EEF3FF"
                    onClick={() => {
                        questImageVis();
                    }}
                >
                    View Quest Images
                </Button>
                {revealAccordian ? (
                    <Button
                        variant="outline"
                        color="#EEF3FF"
                        onClick={HandleShowAccordian}
                    >
                        Show Step Details
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        color="#EEF3FF"
                        onClick={HandleShowAccordian}
                    >
                        Show Quest Details
                    </Button>
                )}
            </Flex>
            {revealAccordian ? (
                <Accordion
                    defaultValue=""
                    chevron={
                        <Image
                            src="./../../dist/assets/QuestIconEdited.png"
                            alt="Quest Icon"
                            width="20px"
                            height="20px"
                        />
                    }
                >
                    <Accordion.Item
                        key={1}
                        value="Click to Show Quest Requirements"
                    >
                        <Accordion.Control
                            styles={{
                                control: { color: "#4e85bc" },
                            }}
                        >
                            Requirements
                        </Accordion.Control>
                        <Accordion.Panel>
                            <div>
                                {questDetailsInfo!["Requirements"].map(
                                    (value) => {
                                        return (
                                            <List listStyleType="">
                                                <List.Item>{value}</List.Item>
                                            </List>
                                        );
                                    }
                                )}
                            </div>
                        </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item key={2} value="Click to Show Start Point">
                        <Accordion.Control
                            className="AccordianControl"
                            styles={{
                                control: { color: "#4e85bc" },
                            }}
                        >
                            Start Point
                        </Accordion.Control>
                        <Accordion.Panel>
                            <div>{questDetailsInfo!["StartPoint"]}</div>
                        </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item key={3} value="Members Or Not">
                        <Accordion.Control
                            className="AccordianControl"
                            styles={{
                                control: { color: "#4e85bc" },
                            }}
                        >
                            Is This a Members Quest?
                        </Accordion.Control>
                        <Accordion.Panel>
                            <div>{questDetailsInfo!["MemberRequirement"]}</div>
                        </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item key={4} value="Official Length of Quest">
                        <Accordion.Control
                            className="AccordianControl"
                            styles={{
                                control: { color: "#4e85bc" },
                            }}
                        >
                            How Long is This Quest?
                        </Accordion.Control>
                        <Accordion.Panel>
                            <div>{questDetailsInfo!["OfficialLength"]}</div>
                        </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item key={5} value="Items Required">
                        <Accordion.Control
                            className="AccordianControl"
                            styles={{
                                control: { color: "#4e85bc" },
                            }}
                        >
                            Items You Definitely Need
                        </Accordion.Control>
                        <Accordion.Panel>
                            <div>
                                {questDetailsInfo!["ItemsRequired"].map(
                                    (value) => {
                                        return (
                                            <List>
                                                <List.Item>{value}</List.Item>
                                            </List>
                                        );
                                    }
                                )}
                            </div>
                        </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item key={6} value="Recommended">
                        <Accordion.Control
                            className="AccordianControl"
                            title="Items You Might Need"
                            styles={{
                                control: { color: "#4e85bc" },
                            }}
                        >
                            Items You Might Need
                        </Accordion.Control>
                        <Accordion.Panel>
                            <div>
                                {questDetailsInfo!["Recommended"].map(
                                    (value) => {
                                        return (
                                            <List>
                                                <List.Item>{value}</List.Item>
                                            </List>
                                        );
                                    }
                                )}
                            </div>
                        </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item key={7} value="Enemies to Defeat">
                        <Accordion.Control
                            className="AccordianControl"
                            styles={{
                                control: { color: "#4e85bc" },
                            }}
                        >
                            Enemies To Look Out For
                        </Accordion.Control>
                        <Accordion.Panel>
                            <div>
                                {questDetailsInfo!["EnemiesToDefeat"].map(
                                    (value) => {
                                        return (
                                            <List>
                                                <List.Item>{value}</List.Item>
                                            </List>
                                        );
                                    }
                                )}
                            </div>
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>
            ) : (
                <Stepper
                    className="stepperContainer"
                    active={active}
                    onStepClick={setActiveAndScroll}
                    orientation="vertical"
                >
                    {stepDetails.map((value, index) => (
                        <Stepper.Step
                            id={index.toString()}
                            className="stepperStep"
                            label={`Step: ${index + 1}`}
                            key={index}
                            orientation="vertical"
                            description={value}
                            allowStepSelect={shouldAllowSelectStep(index)}
                        />
                    ))}
                </Stepper>
            )}
        </>
    );
};

export default QuestPage;
