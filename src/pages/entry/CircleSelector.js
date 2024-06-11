import React, { useMemo } from "react";

import { PieChart } from "react-minimal-pie-chart";

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}
  
function describeArc(x, y, radius, startAngle, endAngle){
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;     
}

const iconRenderer = ({ x, y, dataEntry: { degrees, iconRef, startAngle, title }}) => {
    // TODO calculate radious
    const radius = 50;
    // TODO Explore why this is needed (possibly the pie char library uses another zero-orientation?!)
    const angleCorrection = 90;
    return (
        <svg>
            <defs>
                <pattern id={ `pattern-${title}` } width="100%" height="100%" patternContentUnits="objectBoundingBox">
                    <image x="0.25" y="0.25" width="0.5" height="0.5" href={ iconRef } />
                </pattern>
            </defs>
            <path
                d={
                    `M ${x} ${y}
                    ${describeArc(x, y, radius, startAngle + angleCorrection, startAngle + degrees + angleCorrection)}
                    L ${x} ${y}`
                }
                fill={ `url(#pattern-${title})` } />
        </svg>
    );
}

const labelRenderer = ({ dataEntry, ...rest }) => {
    if (dataEntry.iconRef) {
        return iconRenderer({ dataEntry, ...rest });
    }
    return dataEntry.label;
}

const CircleSelector = ({ options, onSelect }) => {
    const adaptedOptions = useMemo(() => options ? options.map(option => ({
        value: 100 / options.length,
        ...option,
    })) : [], [options]);

    return <PieChart data={ adaptedOptions } onMouseOver={ (e, i) => onSelect(adaptedOptions[i]) } label={ labelRenderer } />;
}

export default CircleSelector;