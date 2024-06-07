import React, { useState } from "react";
import { Page, Stack } from "grommet";

import CircleSelector from "./CircleSelector";

import FullPageBox from "../../components/FullPageBox";
import FullPageImage from "../../components/FullPageImage";
import FullPageContent from "../../components/FullPageContent";

const options = [
    {
        color: "#a3c8a3",
        title: "Work",
        label: "Work",
    },
    {
        color: "#73ab73",
        title: "Hobby",
        label: "Hobby",
    },
    {
        color: "#4e834e",
        title: "Family",
        label: "Family",
    },
    {
        color: "#bfd9bf",
        title: "Dog",
        label: "Dog",
    },
    {
        color: "#5e9c5e",
        title: "Cats",
        label: "Cats",
    },
];

const EntryPage = () => {
    const [currentSelection, select] = useState(options[1]);

    return (
        <Page>
            <FullPageContent>
                <Stack anchor="center" interactiveChild="last">
                    { currentSelection && currentSelection.image && <FullPageImage src={ currentSelection.image } /> }
                    <FullPageBox>
                        <CircleSelector options={ options } onSelect={ select } />
                    </FullPageBox>
                </Stack>
            </FullPageContent>
        </Page>
    );
}

export default EntryPage;
