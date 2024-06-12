import React, { useMemo } from "react";

import { PieChart } from "react-minimal-pie-chart";

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function calculateCentroidForArc(x, y, radius, startAngle, endAngle) {
    const arcCenter = { x, y };
    const arcStart = polarToCartesian(x, y, radius, startAngle);
    const arcEnd = polarToCartesian(x, y, radius, endAngle);

    return { x: (arcCenter.x + arcStart.x + arcEnd.x) / 3, y: (arcCenter.y + arcStart.y + arcEnd.y) / 3 };
}

function calculateOuterRectangleForArc(x, y, radius, startAngle, endAngle) {
    const start1 = polarToCartesian(x, y, radius, startAngle);
    const end1 = polarToCartesian(x, y, radius, endAngle);

    const minX = Math.min(x, Math.min(start1.x, end1.x));
    const maxX = Math.max(x, Math.max(start1.x, end1.x));
    const minY = Math.min(y, Math.min(start1.y, end1.y));
    const maxY = Math.max(y, Math.max(start1.y, end1.y));
    
    const centerPoint = {
        x: minX + (maxX - minX) / 2,
        y: minY + (maxY - minY) / 2,
    };
    const innerCorner = { x: minX, y: minY };
    const outerCorner = {
        x: maxX,
        y: maxY,
    };

    return { centerX: centerPoint.x, centerY: centerPoint.y, innerCorner, outerCorner };
}

function calculateCenteringOffsets(x, y, radius, startAngle, endAngle, scaling) {
    const outerRectangle = calculateOuterRectangleForArc(x, y, radius, startAngle, endAngle);
    const innerCornerOfOuterRect = outerRectangle.innerCorner;
    const outerCornerOfOuterRect = outerRectangle.outerCorner;

    const minX = Math.min(x, Math.min(innerCornerOfOuterRect.x, outerCornerOfOuterRect.x));
    const maxX = Math.max(x, Math.max(innerCornerOfOuterRect.x, outerCornerOfOuterRect.x));
    const minY = Math.min(y, Math.min(innerCornerOfOuterRect.y, outerCornerOfOuterRect.y));
    const maxY = Math.max(y, Math.max(innerCornerOfOuterRect.y, outerCornerOfOuterRect.y));

    const baseCenteringOffset = (1 - scaling) / 2;
    const centroid = calculateCentroidForArc(x, y, radius, startAngle, endAngle);

    const xOffset = -baseCenteringOffset + (centroid.x - minX) / (maxX - minX);
    const yOffset = -baseCenteringOffset + (centroid.y - minY) / (maxY - minY);

    return { xOffset, yOffset };
}
  
function describeArc(x, y, radius, startAngle, endAngle){
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;     
}

const iconRenderer = ({ x, y, dataEntry: { degrees, iconRef, startAngle, title }, textAnchor}) => {
    // TODO calculate radious
    const radius = 50;
    // TODO Explore why this is needed (possibly the pie char library uses another zero-orientation?!)
    const angleCorrection = 90;
    // Icons will only use half of the available space to prevent overlap
    const scaling = 0.5;

    var xOffset = 0;
    var yOffset = 0;
    if (textAnchor === "middle") {
        const centeringOffsets = calculateCenteringOffsets(x, y, radius, startAngle + angleCorrection, startAngle + angleCorrection + degrees, scaling);
        xOffset = centeringOffsets.xOffset;
        yOffset = centeringOffsets.yOffset;
    }

    return (
        <svg>
            <defs>
                <pattern id={ `pattern-${title}` } width="100%" height="100%" patternContentUnits="objectBoundingBox">
                    <image x={ xOffset } y={ yOffset } width={ scaling } height={ scaling } href={ iconRef } />
                </pattern>
            </defs>
            <path d={ `M ${x} ${y} ${describeArc(x, y, radius, startAngle + angleCorrection, startAngle + degrees + angleCorrection)} L ${x} ${y}` } fill={ `url(#pattern-${title})` } />
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