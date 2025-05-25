import React, { useState, useEffect, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
                                                            value,
                                                            onChange,
                                                            disabled = false
                                                        }) => {
    const [color, setColor] = useState(value || '#000000');
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Update local state when value prop changes
    useEffect(() => {
        setColor(value || '#000000');
    }, [value]);

    // Handle color change
    const handleColorChange = (newColor: string) => {
        setColor(newColor);
    };

    // Apply color change
    const applyColor = () => {
        onChange(color);
        setIsOpen(false);
    };

    // Reset color
    const resetColor = () => {
        setColor(value || '#000000');
        setIsOpen(false);
    };

    // Common colors for quick selection
    const commonColors = [
        '#000000', '#ffffff', '#f44336', '#e91e63', '#9c27b0',
        '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
        '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b',
        '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e'
    ];

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled={disabled}
                >
                    <div className="flex items-center gap-2">
                        <div
                            className="w-5 h-5 rounded-sm border"
                            style={{ backgroundColor: color }}
                        />
                        <span>{color}</span>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="color-input">Color</Label>
                        <div className="flex gap-2 mt-1">
                            <Input
                                ref={inputRef}
                                id="color-input"
                                type="text"
                                value={color}
                                onChange={(e) => handleColorChange(e.target.value)}
                                className="flex-1"
                            />
                            <Input
                                type="color"
                                value={color}
                                onChange={(e) => handleColorChange(e.target.value)}
                                className="w-10 p-1 h-10"
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Common Colors</Label>
                        <div className="grid grid-cols-5 gap-2 mt-1">
                            {commonColors.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className="w-full aspect-square rounded-sm border"
                                    style={{ backgroundColor: c }}
                                    onClick={() => handleColorChange(c)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={resetColor}
                        >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={applyColor}
                        >
                            <Check className="h-4 w-4 mr-1" />
                            Apply
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};
