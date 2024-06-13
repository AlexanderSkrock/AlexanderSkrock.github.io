import React, { useMemo } from "react";

import { PieChart } from "react-minimal-pie-chart";

// Icons will only use half of the available space to prevent overlap
const ICON_SCALING = 0.5;

// FIXME Explore why this is needed (possibly the pie char library uses another zero-orientation?!)
// We use this as a bridge between the angles the library provides and the angles we use in our calculations.
const ANGLE_CORRECTION = 90;

function defaultRadius() {
    // see default values: https://www.npmjs.com/package/react-minimal-pie-chart#about-data-prop
    const viewBoxSize = 100;
    const radiusSize = 50;
    return viewBoxSize * radiusSize / 100;
}

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
    // Currently we rely on the default radius as the label render props do not include all necessary information
    // As alternative we could create a renderer on mount because at this level we could influence all relevant props for the pie chart.
    const radius = defaultRadius();

    var xOffset = 0;
    var yOffset = 0;
    if (textAnchor === "middle") {
        const centeringOffsets = calculateCenteringOffsets(x, y, radius, startAngle + ANGLE_CORRECTION, startAngle + ANGLE_CORRECTION + degrees, ICON_SCALING);
        xOffset = centeringOffsets.xOffset;
        yOffset = centeringOffsets.yOffset;
    }

    return (
        <svg>
            <defs>
                <pattern id={ `pattern-${title}` } width="100%" height="100%" patternContentUnits="objectBoundingBox">
                    <image x={ xOffset } y={ yOffset } width={ ICON_SCALING } height={ ICON_SCALING } href={ iconRef } />
                </pattern>
            </defs>
            <path d={ `M ${x} ${y} ${describeArc(x, y, radius, startAngle + ANGLE_CORRECTION, startAngle + degrees + ANGLE_CORRECTION)} L ${x} ${y}` } fill={ `url(#pattern-${title})` } />
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