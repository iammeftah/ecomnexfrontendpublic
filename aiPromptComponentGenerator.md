# React Component Generation Guide

## Component Structure Requirements

When creating React components for this project, they must follow a specific structure to ensure compatibility with our backend system.

### Required Props Format

```javascript
const props = {
  "propertyName": {
    "type": "text", // Can be: text, image, color, number, array, boolean, etc.
    "value": "The actual content value",
    "label": "Human-readable label",
    "editable": true // Controls editability in the admin interface
  },
  // Add more properties following this same structure
};
```

### Accessing Properties in JSX

Always access property values using the `.value` attribute:

```jsx
<h1 className="text-xl font-bold">{props.title.value}</h1>
<p className="text-gray-600">{props.description.value}</p>
<img src={props.imageUrl.value} alt={props.imageAlt.value} />
```

### Property Type Reference

- `text`: For text content (headings, paragraphs, button text)
- `image`: For image URLs
- `color`: For color values (HEX, RGB, etc.)
- `number`: For numeric values (counts, dimensions, opacity)
- `array`: For lists or collections (navigation items, features, etc.)
- `boolean`: For toggle options (show/hide elements)
- `url`: For links and navigation targets

## Styling Guidelines

- Use Tailwind CSS classes for styling when possible
- Create responsive designs (mobile-first approach)
- Include hover states and transitions for interactive elements
- Follow modern design principles with proper spacing and hierarchy
- Ensure components are visually appealing and professional

## Example Component

Here's a reference implementation that demonstrates the required structure:

```jsx
import React, { useState } from 'react';

const FeatureCard = () => {
  // Props with the required structure
  const props = {
    "title": {
      "type": "text",
      "value": "Feature Title",
      "label": "Title",
      "editable": true
    },
    "description": {
      "type": "text",
      "value": "This feature will help you accomplish specific tasks efficiently and effectively.",
      "label": "Description",
      "editable": true
    },
    "iconName": {
      "type": "text",
      "value": "sparkles",
      "label": "Icon Name",
      "editable": true
    },
    "backgroundColor": {
      "type": "color",
      "value": "#f3f4f6",
      "label": "Background Color",
      "editable": true
    },
    "accentColor": {
      "type": "color",
      "value": "#4f46e5",
      "label": "Accent Color",
      "editable": true
    }
  };

  // Component state
  const [isHovered, setIsHovered] = useState(false);

  // Icon mapping function
  const renderIcon = (iconName) => {
    switch(iconName) {
      case 'sparkles':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="p-6 rounded-xl transition-all duration-300"
      style={{ 
        backgroundColor: props.backgroundColor.value,
        boxShadow: isHovered ? '0 10px 25px -5px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="w-12 h-12 flex items-center justify-center rounded-lg mb-4"
        style={{ backgroundColor: props.accentColor.value, color: 'white' }}
      >
        {renderIcon(props.iconName.value)}
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{props.title.value}</h3>
      
      <p className="text-gray-600">{props.description.value}</p>
    </div>
  );
};

export default FeatureCard;
```

## Required Components

Please create the following components using this structured format:

1. Hero - A full-width banner with heading, subheading, and CTA buttons
2. Features - A grid or list of feature highlights with icons
3. Testimonials - Customer quotes with images and attribution
4. Pricing - Pricing tiers with features and CTA buttons
5. Contact - Contact form with inputs and submit button
6. Footer - Site footer with navigation and copyright

Each component should:
- Be visually attractive and modern
- Include appropriate hover states and animations
- Be responsive across device sizes
- Have all customizable aspects defined in the props structure
- Follow the exact props format defined above

## Critical Implementation Notes

1. Always use the structured props format shown above
2. Always access property values with `.value` in JSX
3. Never deviate from this format as it will break backend compatibility
4. Include comments explaining complex logic or customization options
5. Ensure each component is self-contained with no external dependencies

Failure to follow this structure will result in components that cannot be saved or edited properly in our CMS system.
