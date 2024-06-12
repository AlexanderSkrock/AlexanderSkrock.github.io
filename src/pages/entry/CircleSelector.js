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

    const centerOfCircle = { x, y };

    const start1 = polarToCartesian(x, y, radius, startAngle + angleCorrection);
    const end1 = polarToCartesian(x, y, radius, startAngle + angleCorrection + degrees);

    const m1 = (end1.y - start1.y) / (end1.x - start1.x);
    const b1 = m1 + start1.y - (m1 * start1.x)

    const start2 = centerOfCircle;
    const end2 = polarToCartesian(x, y, radius, startAngle + angleCorrection + (degrees / 2));

    const m2 = (end2.y - start2.y) / (end2.x - start2.x);
    const b2 = m2 + start2.y - (m2 * start2.x)

    const centerXOfInnerRect = (b2 - b1) / (m1 - m2);
    const centerYOfInnerRect = m1 * centerXOfInnerRect + b1;
    const centerOfInnerRect = { x: centerXOfInnerRect, y: centerYOfInnerRect };

    const minX = Math.min(centerOfCircle.x, Math.min(start1.x, end1.x));
    const maxX = Math.max(centerOfCircle.x, Math.max(start1.x, end1.x));
    const minY = Math.min(centerOfCircle.y, Math.min(start1.y, end1.y));
    const maxY = Math.max(centerOfCircle.y, Math.max(start1.y, end1.y));

    const centerOfOuterRect = {
        x: minX + (maxX - minX) / 2,
        y: minY + (maxY - minY) / 2,
    }
    const start3 = centerOfCircle;
    const end3 = {
        x: start3.x + 2 * relative(start3, centerOfOuterRect).x,
        y: start3.y + 2 * relative(start3, centerOfOuterRect).y,
    };

    const xFactor = relative(centerOfOuterRect, centerOfInnerRect).x === 0
        ? 0
        : (relative(centerOfOuterRect, centerOfInnerRect).x > 0 ? 1 : -1);
    const yFactor = relative(centerOfOuterRect, centerOfInnerRect).y === 0
        ? 0
        : (relative(centerOfOuterRect, centerOfInnerRect).y > 0 ? 1 : -1);

    return (
        <svg>
            <defs>
                <pattern id={ `pattern-${title}` } width="100%" height="100%" patternContentUnits="objectBoundingBox">
                    <image
                        x={ 0.25 + (distX(start3, end3) === 0 ? 0 : xFactor * 0.25 * distX(centerOfInnerRect, centerOfOuterRect) / distX(start3, end3)) }
                        y={ 0.25 + (distY(start3, end3) === 0 ? 0 : yFactor * 0.25 * distY(centerOfInnerRect, centerOfOuterRect) / distY(start3, end3)) }
                        width="0.5"
                        height="0.5"
                        href={ iconRef }
                    />
                </pattern>
                <marker 
                    id='head' 
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
            <rect x={ start3.x } y={ start3.y } width={ distX(start3, end3) } height={ distY(start3, end3) } stroke="red" fill="none"/>
            <path markerEnd="url(#head)" d={ `M ${centerOfOuterRect.x} ${centerOfOuterRect.y} L ${centerOfInnerRect.x} ${centerOfInnerRect.y}` } stroke="blue"></path>
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