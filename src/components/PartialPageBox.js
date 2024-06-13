import React, { useContext, useMemo } from "react";

import { Box } from "grommet";

import ConstantsContext from "../ConstantsContext";

const PartialPageBox = ({ fraction, ...restProps }) => {
    const { mainHeight } = useContext(ConstantsContext);
    const height = useMemo(() => `calc(${mainHeight} * ${fraction})`, [mainHeight, fraction]);

    return <Box { ...restProps } height={ height } />;
}

export default PartialPageBox;