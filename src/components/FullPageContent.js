import React, { useContext } from "react";
import { PageContent } from "grommet";

import ConstantsContext from "../ConstantsContext";

const FullPageContent = (props) => {
    const { mainHeight } = useContext(ConstantsContext);
    return <PageContent { ...props } height={ mainHeight } />;
}

export default FullPageContent;
