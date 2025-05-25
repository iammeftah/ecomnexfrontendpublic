// Fixed tailwind-mapper.ts with no duplicate properties

/**
 * A utility to map component properties to complete Tailwind classes
 * without needing thousands of individual mappings
 */

// Color shades available in Tailwind
const TAILWIND_SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

// Color names available in Tailwind
const TAILWIND_COLORS = [
    'slate', 'gray', 'zinc', 'neutral', 'stone', // Gray scales
    'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan',
    'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose',
    // Special colors
    'white', 'black', 'transparent', 'current'
];

// Common Tailwind class prefixes - each key must be unique
const TAILWIND_PREFIXES = {
    // Colors
    'bg': 'Background color',
    'text-color': 'Text color', // Changed from 'text' to avoid duplicate
    'border-color': 'Border color', // Changed from 'border' to avoid duplicate
    'ring': 'Ring color',
    'shadow-color': 'Shadow color', // Changed from 'shadow' to avoid duplicate
    'fill': 'SVG fill color',
    'stroke': 'SVG stroke color',
    'accent': 'Accent color',
    'caret': 'Caret color',
    'divide': 'Divide color',
    'outline': 'Outline color',
    'placeholder': 'Placeholder color',
    'ring-offset': 'Ring offset color',

    // Spacing
    'p': 'Padding',
    'px': 'Horizontal padding',
    'py': 'Vertical padding',
    'pt': 'Padding top',
    'pr': 'Padding right',
    'pb': 'Padding bottom',
    'pl': 'Padding left',
    'm': 'Margin',
    'mx': 'Horizontal margin',
    'my': 'Vertical margin',
    'mt': 'Margin top',
    'mr': 'Margin right',
    'mb': 'Margin bottom',
    'ml': 'Margin left',
    'space-x': 'Horizontal space between',
    'space-y': 'Vertical space between',
    'gap': 'Gap',
    'gap-x': 'Horizontal gap',
    'gap-y': 'Vertical gap',

    // Typography
    'font': 'Font family',
    'text-size': 'Text size', // Changed from 'text' to avoid duplicate
    'font-bold': 'Font weight',
    'italic': 'Font style',
    'tracking': 'Letter spacing',
    'leading': 'Line height',
    'list': 'List style',
    'underline': 'Text decoration',
    'uppercase': 'Text transform',
    'truncate': 'Text overflow',
    'indent': 'Text indent',

    // Layout
    'w': 'Width',
    'h': 'Height',
    'min-w': 'Min width',
    'min-h': 'Min height',
    'max-w': 'Max width',
    'max-h': 'Max height',
    'float': 'Float',
    'overflow': 'Overflow',
    'overscroll': 'Overscroll',
    'position-static': 'Position', // Changed from 'static' to avoid keyword issues
    'inset': 'Top/Right/Bottom/Left',
    'z': 'Z-index',

    // Flexbox & Grid
    'flex': 'Flex',
    'flex-row': 'Flex direction',
    'flex-grow': 'Flex grow',
    'flex-shrink': 'Flex shrink',
    'order': 'Order',
    'justify': 'Justify content',
    'items': 'Align items',
    'self': 'Align self',
    'grid': 'Grid',
    'grid-cols': 'Grid columns',
    'grid-rows': 'Grid rows',
    'grid-flow': 'Grid auto flow',
    'col': 'Grid column',
    'row': 'Grid row',

    // Effects
    'shadow-size': 'Shadow', // Changed from 'shadow' to avoid duplicate
    'opacity': 'Opacity',
    'mix-blend': 'Mix blend mode',
    'grayscale': 'Grayscale',
    'invert': 'Invert',
    'blur': 'Blur',
    'brightness': 'Brightness',
    'contrast': 'Contrast',
    'hue-rotate': 'Hue rotate',
    'saturate': 'Saturate',
    'sepia': 'Sepia',

    // Borders
    'rounded': 'Border radius',
    'rounded-t': 'Border radius top',
    'rounded-r': 'Border radius right',
    'rounded-b': 'Border radius bottom',
    'rounded-l': 'Border radius left',
    'rounded-tl': 'Border radius top left',
    'rounded-tr': 'Border radius top right',
    'rounded-bl': 'Border radius bottom left',
    'rounded-br': 'Border radius bottom right',
    'border-width': 'Border width', // Changed from 'border' to avoid duplicate
    'border-t': 'Border top width',
    'border-r': 'Border right width',
    'border-b': 'Border bottom width',
    'border-l': 'Border left width',

    // Tables
    'table': 'Table layout',
    'border-collapse': 'Border collapse',

    // Transitions & Animation
    'transition': 'Transition',
    'duration': 'Transition duration',
    'ease': 'Transition timing function',
    'delay': 'Transition delay',
    'animate': 'Animation',

    // Transforms
    'scale': 'Scale',
    'rotate': 'Rotate',
    'translate': 'Translate',
    'skew': 'Skew',
    'origin': 'Transform origin',

    // Interactivity
    'cursor': 'Cursor',
    'select': 'User select',
    'resize': 'Resize',
    'pointer-events': 'Pointer events',

    // SVG
    'fill-color': 'Fill', // Changed from 'fill' to avoid duplicate
    'stroke-color': 'Stroke', // Changed from 'stroke' to avoid duplicate
    'stroke-w': 'Stroke width',

    // Accessibility
    'sr': 'Screen reader',

    // Dark Mode
    'dark': 'Dark mode',

    // Variants
    'hover': 'Hover',
    'focus': 'Focus',
    'active': 'Active',
    'disabled': 'Disabled',
    'visited': 'Visited',
    'checked': 'Checked',
    'first': 'First',
    'last': 'Last',
    'odd': 'Odd',
    'even': 'Even',
};

/**
 * Maps a color property value to a complete Tailwind color class
 * @param prefix The Tailwind prefix (bg, text, border, etc.)
 * @param colorValue The color value (can be 'blue-500', 'red', etc.)
 * @returns A complete Tailwind class or empty string if invalid
 */
export const mapToTailwindColorClass = (prefix: string, colorValue: string | undefined): string => {
    if (!colorValue) return '';

    // Handle special cases
    if (['white', 'black', 'transparent', 'current'].includes(colorValue)) {
        return `${prefix}-${colorValue}`;
    }

    // Handle color-shade format
    const parts = colorValue.split('-');
    if (parts.length === 2) {
        const [color, shade] = parts;
        if (TAILWIND_COLORS.includes(color) && TAILWIND_SHADES.includes(shade)) {
            return `${prefix}-${color}-${shade}`;
        }
    } else if (parts.length === 1 && TAILWIND_COLORS.includes(parts[0])) {
        // Default to 500 if only color is specified
        return `${prefix}-${parts[0]}-500`;
    }

    // If value already starts with the prefix, assume it's already a complete class
    if (colorValue.startsWith(`${prefix}-`)) {
        return colorValue;
    }

    return '';
};

/**
 * Maps a spacing property value to a complete Tailwind spacing class
 * @param prefix The Tailwind prefix (p, m, gap, etc.)
 * @param value The spacing value
 * @returns A complete Tailwind class or empty string if invalid
 */
export const mapToTailwindSpacingClass = (prefix: string, value: string | undefined): string => {
    if (!value) return '';

    // Check if the value is already a numeric Tailwind spacing value
    const spacingValues = ['0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6', '7', '8', '9', '10', '11', '12',
        '14', '16', '20', '24', '28', '32', '36', '40', '44', '48', '52', '56', '60', '64', '72', '80',
        '96', 'auto', 'px', 'full', 'screen'];

    if (spacingValues.includes(value)) {
        return `${prefix}-${value}`;
    }

    // Handle semantic values
    switch (value.toLowerCase()) {
        case 'none': return `${prefix}-0`;
        case 'small': return `${prefix}-2`;
        case 'medium': return `${prefix}-4`;
        case 'large': return `${prefix}-8`;
        case 'xlarge': return `${prefix}-16`;
        default: return '';
    }
};

/**
 * Maps text alignment property to Tailwind class
 * @param value The alignment value
 * @returns A complete Tailwind class
 */
export const mapToTailwindTextAlignClass = (value: string | undefined): string => {
    if (!value) return '';

    switch (value.toLowerCase()) {
        case 'left': return 'text-left';
        case 'center': return 'text-center';
        case 'right': return 'text-right';
        case 'justify': return 'text-justify';
        default: return '';
    }
};

/**
 * Maps display property to Tailwind class
 * @param value The display value
 * @returns A complete Tailwind class
 */
export const mapToTailwindDisplayClass = (value: string | undefined): string => {
    if (!value) return '';

    switch (value.toLowerCase()) {
        case 'block': return 'block';
        case 'inline': return 'inline';
        case 'inline-block': return 'inline-block';
        case 'flex': return 'flex';
        case 'inline-flex': return 'inline-flex';
        case 'grid': return 'grid';
        case 'inline-grid': return 'inline-grid';
        case 'hidden': return 'hidden';
        default: return '';
    }
};

/**
 * Maps a font size property to a Tailwind class
 * @param value The font size value
 * @returns A complete Tailwind class
 */
export const mapToTailwindFontSizeClass = (value: string | undefined): string => {
    if (!value) return '';

    switch (value.toLowerCase()) {
        case 'xs': return 'text-xs';
        case 'sm': return 'text-sm';
        case 'base': return 'text-base';
        case 'lg': return 'text-lg';
        case 'xl': return 'text-xl';
        case '2xl': return 'text-2xl';
        case '3xl': return 'text-3xl';
        case '4xl': return 'text-4xl';
        case '5xl': return 'text-5xl';
        case '6xl': return 'text-6xl';
        case '7xl': return 'text-7xl';
        case '8xl': return 'text-8xl';
        case '9xl': return 'text-9xl';
        default: return '';
    }
};

/**
 * Maps a font weight property to a Tailwind class
 * @param value The font weight value
 * @returns A complete Tailwind class
 */
export const mapToTailwindFontWeightClass = (value: string | undefined): string => {
    if (!value) return '';

    switch (value.toLowerCase()) {
        case 'thin': return 'font-thin';
        case 'extralight': return 'font-extralight';
        case 'light': return 'font-light';
        case 'normal': return 'font-normal';
        case 'medium': return 'font-medium';
        case 'semibold': return 'font-semibold';
        case 'bold': return 'font-bold';
        case 'extrabold': return 'font-extrabold';
        case 'black': return 'font-black';
        default: return '';
    }
};

/**
 * Maps a border radius property to a Tailwind class
 * @param value The border radius value
 * @returns A complete Tailwind class
 */
export const mapToTailwindBorderRadiusClass = (value: string | undefined): string => {
    if (!value) return '';

    switch (value.toLowerCase()) {
        case 'none': return 'rounded-none';
        case 'small': return 'rounded-sm';
        case 'medium':
        case 'default': return 'rounded';
        case 'large': return 'rounded-lg';
        case 'xlarge': return 'rounded-xl';
        case '2xlarge': return 'rounded-2xl';
        case '3xlarge': return 'rounded-3xl';
        case 'full': return 'rounded-full';
        default: return '';
    }
};

/**
 * Maps a shadow property to a Tailwind class
 * @param value The shadow value
 * @returns A complete Tailwind class
 */
export const mapToTailwindShadowClass = (value: string | undefined): string => {
    if (!value) return '';

    switch (value.toLowerCase()) {
        case 'none': return 'shadow-none';
        case 'small': return 'shadow-sm';
        case 'medium':
        case 'default': return 'shadow';
        case 'large': return 'shadow-md';
        case 'xlarge': return 'shadow-lg';
        case '2xlarge': return 'shadow-xl';
        case '3xlarge': return 'shadow-2xl';
        case 'inner': return 'shadow-inner';
        default: return '';
    }
};

/**
 * Maps a width or height property to a Tailwind class
 * @param prefix The prefix (w or h)
 * @param value The width/height value
 * @returns A complete Tailwind class
 */
export const mapToTailwindSizeClass = (prefix: string, value: string | undefined): string => {
    if (!value) return '';

    // Handle percentage values
    if (value.endsWith('%')) {
        const percentage = value.slice(0, -1);
        switch (percentage) {
            case '25': return `${prefix}-1/4`;
            case '33': return `${prefix}-1/3`;
            case '50': return `${prefix}-1/2`;
            case '66': return `${prefix}-2/3`;
            case '75': return `${prefix}-3/4`;
            case '100': return `${prefix}-full`;
        }
    }

    // Handle semantic values
    switch (value.toLowerCase()) {
        case 'auto': return `${prefix}-auto`;
        case 'full': return `${prefix}-full`;
        case 'screen': return `${prefix}-screen`;
        case 'small': return `${prefix}-24`;
        case 'medium': return `${prefix}-48`;
        case 'large': return `${prefix}-96`;
        default:
            // Check if it's a valid numeric spacing value
            const spacingValues = ['0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6', '7', '8', '9', '10', '11', '12',
                '14', '16', '20', '24', '28', '32', '36', '40', '44', '48', '52', '56', '60', '64', '72', '80',
                '96'];
            if (spacingValues.includes(value)) {
                return `${prefix}-${value}`;
            }
            return '';
    }
};

/**
 * Processes a component styles object to extract Tailwind classes
 * @param styles The component styles object
 * @returns A string of Tailwind classes
 */
export const extractTailwindClasses = (styles: Record<string, any> | undefined): string => {
    if (!styles) return '';

    const classes: string[] = [];

    // Process Tailwind classes embedded directly
    if (styles.tailwindClasses && typeof styles.tailwindClasses === 'string') {
        classes.push(styles.tailwindClasses);
    }

    // Process color properties
    if (styles.backgroundColor) {
        classes.push(mapToTailwindColorClass('bg', styles.backgroundColor));
    }
    if (styles.textColor) {
        classes.push(mapToTailwindColorClass('text', styles.textColor));
    }
    if (styles.borderColor) {
        classes.push(mapToTailwindColorClass('border', styles.borderColor));
    }

    // Process spacing properties
    if (styles.padding) {
        classes.push(mapToTailwindSpacingClass('p', styles.padding));
    }
    if (styles.margin) {
        classes.push(mapToTailwindSpacingClass('m', styles.margin));
    }
    if (styles.paddingX) {
        classes.push(mapToTailwindSpacingClass('px', styles.paddingX));
    }
    if (styles.paddingY) {
        classes.push(mapToTailwindSpacingClass('py', styles.paddingY));
    }
    if (styles.marginX) {
        classes.push(mapToTailwindSpacingClass('mx', styles.marginX));
    }
    if (styles.marginY) {
        classes.push(mapToTailwindSpacingClass('my', styles.marginY));
    }

    // Process layout properties
    if (styles.display) {
        classes.push(mapToTailwindDisplayClass(styles.display));
    }
    if (styles.width) {
        classes.push(mapToTailwindSizeClass('w', styles.width));
    }
    if (styles.height) {
        classes.push(mapToTailwindSizeClass('h', styles.height));
    }
    if (styles.maxWidth) {
        classes.push(mapToTailwindSizeClass('max-w', styles.maxWidth));
    }

    // Process typography properties
    if (styles.fontSize) {
        classes.push(mapToTailwindFontSizeClass(styles.fontSize));
    }
    if (styles.fontWeight) {
        classes.push(mapToTailwindFontWeightClass(styles.fontWeight));
    }
    if (styles.textAlign) {
        classes.push(mapToTailwindTextAlignClass(styles.textAlign));
    }

    // Process border properties
    if (styles.borderRadius) {
        classes.push(mapToTailwindBorderRadiusClass(styles.borderRadius));
    }
    if (styles.borderWidth) {
        classes.push(mapToTailwindSpacingClass('border', styles.borderWidth));
    }

    // Process shadow properties
    if (styles.shadow) {
        classes.push(mapToTailwindShadowClass(styles.shadow));
    }

    // Filter out any empty classes
    return classes.filter(Boolean).join(' ');
};

/**
 * Extract values from props, handling both direct values and structured props
 * @param props The component properties
 * @returns An object with extracted values
 */
export const extractPropValues = (props: Record<string, any> | undefined): Record<string, any> => {
    if (!props) return {};

    const extractedProps: Record<string, any> = {};

    for (const [key, prop] of Object.entries(props)) {
        // Handle props in format { value: "something", type: "..." }
        if (prop && typeof prop === 'object' && 'value' in prop) {
            extractedProps[key] = prop.value;
        } else {
            // Handle direct values
            extractedProps[key] = prop;
        }
    }

    return extractedProps;
};
