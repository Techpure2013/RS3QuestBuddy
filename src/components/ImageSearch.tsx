import { useState, useEffect } from "react";
import { getImageDataFromUrl } from "../util/alt1Util";
import * as alt1 from "alt1";
import { Group, TextInput } from "@mantine/core";

const ImageSearch = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const image = alt1.captureHoldFullRs();
    useEffect(() => {
        getImageDataFromUrl("/homebutton.data.png").then((imageData) => {
            if (imageData) {
                const position = image.findSubimage(imageData);
                if (position[0]) {
                    setPosition(position[0]);
                }
            }
        });
    }, []);
    return (
        <>
            <Group>
                <TextInput disabled label="X Coordinate" value={position.x} />
                <TextInput disabled label="Y Coordinate" value={position.y} />
            </Group>
            <img
                src={`data:image/png;base64,${image.toData().toPngBase64()}`}
                width={"100%"}
            />
        </>
    );
};

export default ImageSearch;
