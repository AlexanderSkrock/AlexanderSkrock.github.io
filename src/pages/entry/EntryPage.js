import React, { useState } from "react";
import { Page, Stack } from "grommet";

import CircleSelector from "./CircleSelector";

import FullPageImage from "../../components/FullPageImage";
import FullPageContent from "../../components/FullPageContent";
import PartialPageBox from "../../components/PartialPageBox";

import business from "./business.svg";
import cat from "./cat.svg";
import dog from "./dog.svg";
import family from "./family.svg";
import hobby from "./hobby.svg";

const options = [
    {
        color: "#a3c8a3",
        title: "Work",
        iconRef: business,
    },
    {
        color: "#73ab73",
        title: "Hobby",
        iconRef: hobby,
    },
    {
        color: "#4e834e",
        title: "Family",
        iconRef: family,
    },
    {
        color: "#bfd9bf",
        title: "Dog",
        iconRef: dog,
    },
    {
        color: "#5e9c5e",
        title: "Cats",
        iconRef: cat,
    },
];

const EntryPage = () => {
    const [currentSelection, select] = useState(options[1]);

    return (
        <Page data-testid="entryPage">
            <FullPageContent justify="center">
                <Stack anchor="center" interactiveChild="last">
                    { currentSelection && currentSelection.image && <FullPageImage src={ currentSelection.image } /> }
                    <PartialPageBox fraction={ 0.5 }>
                        <CircleSelector options={ options } onSelect={ select } />
                    </PartialPageBox>
                </Stack>
            </FullPageContent>
        </Page>
    );
}

export default EntryPage;
