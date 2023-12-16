import { useState, useEffect, useRef } from "react";
import * as alt1 from "alt1";
import { Stack, Text, TextInput } from "@mantine/core";
import { useStore } from "./../store/store";
import OCRChat from "alt1/chatbox";

const createNewReader = () => {
    const reader = new OCRChat();

    reader.readargs = {
        colors: [
            alt1.mixColor(45, 186, 21), // Completion time green
            alt1.mixColor(159, 255, 159), // Clan chat green
            alt1.mixColor(255, 82, 86), // PM red
            alt1.mixColor(225, 35, 35), // Nex P3 spec text
            alt1.mixColor(153, 255, 153), // "Nex:" green
            alt1.mixColor(155, 48, 255), // "Nex:" purple
            alt1.mixColor(255, 0, 255), //
            alt1.mixColor(0, 255, 255), //
            alt1.mixColor(255, 0, 0), // Red
            alt1.mixColor(255, 255, 255), // White
            alt1.mixColor(127, 169, 255), // Clock blue
            alt1.mixColor(45, 184, 20), // Completion time green
        ],
    };

    return reader;
};

const Chatbox = () => {
    const store = useStore();
    const readerRef = useRef(createNewReader());

    useEffect(() => {
        const interval = setInterval(() => {
            let chatLines = readerRef.current.read();

            if (chatLines == null) {
                readerRef.current.find();
                chatLines = readerRef.current.read() || [];
            }

            const fixedChatLines = chatLines.reduce<string[]>((acc, next) => {
                // console.log(next);
                if (
                    /^[0-9][0-9]:[0-9][0-9]:[0-9][0-9]$/.test(
                        next.fragments[1]?.text
                    )
                ) {
                    acc.push(next.text);
                    console.log(next);
                } else {
                    acc[acc.length - 1] += next.text;
                }
                return acc;
            }, []);

            if (fixedChatLines.length > 0) {
                store.chatBox.setMsg(fixedChatLines.slice(-10));
            }
            // if (ocr) {
            //     const state = ocr.read();
            //     if (state) {
            //         state.forEach((line) => {
            //             console.log(line);
            //         });
            //     }
            // }
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);
    const [find, setFind] = useState("");
    const foundSearchPhrase = !!store.chatBox.msg.find((line: any) =>
        line.toLowerCase().includes(find.toLowerCase())
    );
    return (
        <>
            <TextInput
                onChange={(event) => setFind(event.target.value)}
                value={find}
                label={`Found search phrase: ${foundSearchPhrase}`}
            />
            <Stack>
                {store.chatBox.msg.map((line: any) => {
                    return <Text>{line}</Text>;
                })}
            </Stack>
        </>
    );
};

export default Chatbox;
