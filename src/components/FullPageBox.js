import React, { useContext } from "react";

import { Box } from "grommet";

import ConstantsContext from "../ConstantsContext";

const FullPageBox = ({ children }) => {
    const { mainHeight } = useContext(ConstantsContext);

    return (
        <Box height={ mainHeight }>
            { children }
        </Box>
    );
}

export default FullPageBox;