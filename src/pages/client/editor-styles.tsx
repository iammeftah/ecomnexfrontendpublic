"use client"

export const EditorStyles = () => {
    return (
        <style jsx global>{`
            /* Editor mode styles */
            .component-wrapper {
                position: relative;
                transition: all 0.2s ease;
                cursor: pointer;
                margin-bottom: 1rem;
            }

            .component-wrapper:hover {
                outline: 2px dashed #3b82f6;
                outline-offset: 2px;
            }

            .selected-component {
                outline: 2px solid #3b82f6 !important;
                outline-offset: 2px;
            }

            /* Component label */
            .component-label {
                position: absolute;
                top: -20px;
                left: 0;
                background-color: #3b82f6;
                color: white;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 3px;
                z-index: 10;
                pointer-events: none;
            }

            /* Element selection styles */
            [data-element-id] {
                position: relative;
            }

            [data-element-id]:hover {
                outline: 2px dashed #10b981 !important;
                outline-offset: 2px;
                cursor: pointer;
                z-index: 1;
            }

            [data-element-id]:hover::after {
                content: attr(data-element-type);
                position: absolute;
                top: -18px;
                left: 0;
                background-color: #10b981;
                color: white;
                font-size: 9px;
                padding: 1px 4px;
                border-radius: 2px;
                z-index: 20;
                pointer-events: none;
            }

            /* Selected element style */
            [data-selected-element="true"] {
                outline: 2px solid #10b981 !important;
                outline-offset: 2px;
                position: relative;
                z-index: 2;
            }

            [data-selected-element="true"]::after {
                content: attr(data-element-type);
                position: absolute;
                top: -18px;
                left: 0;
                background-color: #10b981;
                color: white;
                font-size: 9px;
                padding: 1px 4px;
                border-radius: 2px;
                z-index: 20;
                pointer-events: none;
            }

            /* Make sure nested elements can be selected */
            [data-element-id] [data-element-id]:hover {
                outline: 2px dashed #f59e0b !important;
                z-index: 3;
            }

            [data-element-id] [data-element-id]:hover::after {
                background-color: #f59e0b;
            }

            [data-element-id] [data-element-id][data-selected-element="true"] {
                outline: 2px solid #f59e0b !important;
                z-index: 4;
            }

            [data-element-id] [data-element-id][data-selected-element="true"]::after {
                background-color: #f59e0b;
            }

            /* Third level nesting */
            [data-element-id] [data-element-id] [data-element-id]:hover {
                outline: 2px dashed #ec4899 !important;
                z-index: 5;
            }

            [data-element-id] [data-element-id] [data-element-id]:hover::after {
                background-color: #ec4899;
            }

            [data-element-id] [data-element-id] [data-element-id][data-selected-element="true"] {
                outline: 2px solid #ec4899 !important;
                z-index: 6;
            }

            [data-element-id] [data-element-id] [data-element-id][data-selected-element="true"]::after {
                background-color: #ec4899;
            }

            /* Prevent text selection during editing */
            .component-wrapper {
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }

            /* Allow text selection when element is selected */
            [data-selected-element="true"] {
                -webkit-user-select: text;
                -moz-user-select: text;
                -ms-user-select: text;
                user-select: text;
            }

            /* Make sure child elements don't inherit the selection outline */
            .component-wrapper .component-wrapper:hover {
                outline: none !important;
            }

            .component-wrapper .component-wrapper.selected-component {
                outline: none !important;
            }
        `}</style>
    )
}
