import React from "react";

import PartialPageBox from "./PartialPageBox";

const FullPageBox = props => <PartialPageBox { ...props } fraction={ 1 } />

export default FullPageBox;