import React, { useMemo } from "react";

import { PieChart } from "react-minimal-pie-chart";

function relative({ x: x1, y: y1}, { x: x2, y: y2 }) {
    return { x: x2 - x1, y: y2 - y1 };
}

function distX(p1, p2) {
    return Math.abs(relative(p1, p2).x);
}

function distY(p1, p2) {
    return Math.abs(relative(p1, p2).y);
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function calculateInnerRectangleForArc(x, y, radius, startAngle, endAngle) {
    const centerOfCircle = { x, y };

    const start1 = polarToCartesian(x, y, radius, startAngle);
    const end1 = polarToCartesian(x, y, radius, endAngle);

    const m1 = (end1.y - start1.y) / (end1.x - start1.x);
    const b1 = m1 + start1.y - (m1 * start1.x)

    const start2 = centerOfCircle;
    const end2 = polarToCartesian(x, y, radius, startAngle + ((endAngle - startAngle) / 2));

    const m2 = (end2.y - start2.y) / (end2.x - start2.x);
    const b2 = m2 + start2.y - (m2 * start2.x)

    const centerXOfInnerRect = (b2 - b1) / (m1 - m2);
    const centerYOfInnerRect = m1 * centerXOfInnerRect + b1;
    return { centerX: centerXOfInnerRect, centerY: centerYOfInnerRect };
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
    const innerCorner = { x, y };
    const outerCorner = {
        x: innerCorner.x + 2 * relative(innerCorner, centerPoint).x,
        y: innerCorner.y + 2 * relative(innerCorner, centerPoint).y,
    };

    return { centerX: centerPoint.x, centerY: centerPoint.y, innerCorner, outerCorner };
}

function calculateCenteringOffsets(x, y, radius, startAngle, endAngle, scaling) {
    const innerRectangle = calculateInnerRectangleForArc(x, y, radius, startAngle, endAngle)
    const centerOfInnerRect = { x: innerRectangle.centerX, y: innerRectangle.centerY };

    const outerRectangle = calculateOuterRectangleForArc(x, y, radius, startAngle, endAngle);
    const centerOfOuterRect = { x: outerRectangle.centerX, y: outerRectangle.centerY };
    const innerCornerOfOuterRect = outerRectangle.innerCorner;
    const outerCornerOfOuterRect = outerRectangle.outerCorner;

    const xFactor = relative(centerOfOuterRect, centerOfInnerRect).x === 0
        ? 0
        : (relative(centerOfOuterRect, centerOfInnerRect).x > 0 ? 1 : -1);
    const yFactor = relative(centerOfOuterRect, centerOfInnerRect).y === 0
        ? 0
        : (relative(centerOfOuterRect, centerOfInnerRect).y > 0 ? 1 : -1);

    const baseCenteringOffset = (1 - scaling) / 2;
    const xOffset = baseCenteringOffset + (distX(innerCornerOfOuterRect, outerCornerOfOuterRect) === 0 ? 0 : xFactor * baseCenteringOffset * distX(centerOfInnerRect, centerOfOuterRect) / distX(innerCornerOfOuterRect, outerCornerOfOuterRect));
    const yOffset = baseCenteringOffset + (distY(innerCornerOfOuterRect, outerCornerOfOuterRect) === 0 ? 0 : yFactor * baseCenteringOffset * distY(centerOfInnerRect, centerOfOuterRect) / distY(innerCornerOfOuterRect, outerCornerOfOuterRect));
    const offsetPath = `M ${centerOfOuterRect.x} ${centerOfOuterRect.y} L ${centerOfInnerRect.x} ${centerOfInnerRect.y}`;

    return { xOffset, yOffset, offsetPath };
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
    var offsetPath = null;
    if (textAnchor === "middle") {
        const centeringOffsets = calculateCenteringOffsets(x, y, radius, startAngle + angleCorrection, startAngle + angleCorrection + degrees, scaling);
        xOffset = centeringOffsets.xOffset;
        yOffset = centeringOffsets.yOffset;
        offsetPath = <path markerEnd="url(#arrow)" d={ centeringOffsets.offsetPath } stroke="blue"></path>;;
    }

    return (
        <svg>
            <defs>
                <pattern id={ `pattern-${title}` } width="100%" height="100%" patternContentUnits="objectBoundingBox">
                    <image x={ xOffset } y={ yOffset } width={ scaling } height={ scaling } href={ iconRef } />
                </pattern>
                { /* FIXME remove assisting marker */ }
                <marker 
                    id='arrow' 
                    orient="auto" 
                    markerWidth='3' 
                    markerHeight='4' 
                    refX='0.1' 
                    refY='2'
                    >
                    <path d='M0,0 V4 L2,2 Z' fill="black" />
                </marker>
            </defs>
            <path d={ `M ${x} ${y} ${describeArc(x, y, radius, startAngle + angleCorrection, startAngle + degrees + angleCorrection)} L ${x} ${y}` } fill={ `url(#pattern-${title})` } />
            { /* FIXME remove assisting paths */ }
            { offsetPath }
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