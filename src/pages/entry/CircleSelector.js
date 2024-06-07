import React, { useMemo } from "react";

import { PieChart } from "react-minimal-pie-chart";

const CircleSelector = ({ options, onSelect }) => {
    const adaptedOptions = useMemo(() => options ? options.map(option => ({
        value: 100 / options.length,
        ...option,
    })) : [], [options]);

    return (
        <PieChart data={ adaptedOptions } onClick={ (e, i) => onSelect(adaptedOptions[i]) } label={ ({ dataEntry }) => dataEntry.label } />
    )
}

export default CircleSelector;