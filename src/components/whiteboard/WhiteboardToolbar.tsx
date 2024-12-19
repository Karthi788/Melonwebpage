import React, { useState } from 'react';
import { 
  PenTool, 
  Square, 
  Circle, 
  Eraser, 
  Type, 
  Image as ImageIcon,
  Download,
  Trash2,
  Minus,
  Plus,
  MousePointer
} from 'lucide-react';
import useWhiteboardStore from './whiteboardStore';
import { fabric } from 'fabric';

const COLORS = [
  '#000000', '#ffffff', '#808080', '#ff0000', '#ff8000', 
  '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff',
  '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080'
];

const BRUSH_SIZES = [2, 4, 6, 8, 10, 12, 14, 16, 20];

const WhiteboardToolbar: React.FC = () => {
  const { canvas, setCurrentTool, currentTool, currentColor, setCurrentColor, setBrushSize, brushSize } = useWhiteboardStore();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBrushSizes, setShowBrushSizes] = useState(false);

  const handleToolChange = (tool: string) => {
    setCurrentTool(tool);
    if (canvas) {
      canvas.isDrawingMode = tool === 'pen';
      if (tool === 'pen') {
        canvas.freeDrawingBrush.color = currentColor;
        canvas.freeDrawingBrush.width = brushSize;
      } else if (tool === 'eraser') {
        canvas.freeDrawingBrush.color = '#ffffff';
        canvas.freeDrawingBrush.width = brushSize * 2;
      }
    }
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    if (canvas && canvas.isDrawingMode) {
      canvas.freeDrawingBrush.color = color;
    }
  };

  const handleBrushSizeChange = (size: number) => {
    setBrushSize(size);
    if (canvas && canvas.isDrawingMode) {
      canvas.freeDrawingBrush.width = size;
    }
  };

  const handleClear = () => {
    if (canvas) {
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      canvas.renderAll();
    }
  };

  const handleSave = () => {
    if (canvas) {
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1
      });
      const link = document.createElement('a');
      link.download = 'whiteboard.png';
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleAddText = () => {
    if (canvas) {
      const text = new fabric.IText('Double click to edit', {
        left: 100,
        top: 100,
        fontFamily: 'Arial',
        fontSize: 20,
        fill: currentColor
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
    }
  };

  const handleAddImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && canvas) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgData = e.target?.result as string;
          fabric.Image.fromURL(imgData, (img) => {
            img.scaleToWidth(200);
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-2 space-y-2">
      {/* Main Tools */}
      <div className="flex gap-2">
        <button
          onClick={() => handleToolChange('select')}
          className={`p-2 rounded-md ${currentTool === 'select' ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
          title="Select"
        >
          <MousePointer className="w-6 h-6" />
        </button>
        <button
          onClick={() => handleToolChange('pen')}
          className={`p-2 rounded-md ${currentTool === 'pen' ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
          title="Pen Tool"
        >
          <PenTool className="w-6 h-6" />
        </button>
        <button
          onClick={() => handleToolChange('rectangle')}
          className={`p-2 rounded-md ${currentTool === 'rectangle' ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
          title="Rectangle"
        >
          <Square className="w-6 h-6" />
        </button>
        <button
          onClick={() => handleToolChange('circle')}
          className={`p-2 rounded-md ${currentTool === 'circle' ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
          title="Circle"
        >
          <Circle className="w-6 h-6" />
        </button>
        <button
          onClick={() => handleToolChange('eraser')}
          className={`p-2 rounded-md ${currentTool === 'eraser' ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
          title="Eraser"
        >
          <Eraser className="w-6 h-6" />
        </button>
        <button
          onClick={handleAddText}
          className={`p-2 rounded-md hover:bg-gray-100`}
          title="Add Text"
        >
          <Type className="w-6 h-6" />
        </button>
        <button
          onClick={handleAddImage}
          className={`p-2 rounded-md hover:bg-gray-100`}
          title="Add Image"
        >
          <ImageIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Color Picker */}
      <div className="relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="w-8 h-8 rounded-full border-2 border-gray-300"
          style={{ backgroundColor: currentColor }}
          title="Color Picker"
        />
        {showColorPicker && (
          <div className="absolute top-full left-0 mt-2 p-2 bg-white rounded-lg shadow-lg grid grid-cols-5 gap-1">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className="w-6 h-6 rounded-full border border-gray-300"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Brush Size */}
      <div className="relative">
        <button
          onClick={() => setShowBrushSizes(!showBrushSizes)}
          className="flex items-center gap-1 p-2 rounded-md hover:bg-gray-100"
          title="Brush Size"
        >
          <Minus className="w-4 h-4" />
          <span>{brushSize}px</span>
          <Plus className="w-4 h-4" />
        </button>
        {showBrushSizes && (
          <div className="absolute top-full left-0 mt-2 p-2 bg-white rounded-lg shadow-lg">
            {BRUSH_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => handleBrushSizeChange(size)}
                className={`block w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${
                  brushSize === size ? 'bg-indigo-100' : ''
                }`}
              >
                {size}px
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="p-2 rounded-md hover:bg-gray-100"
          title="Save"
        >
          <Download className="w-6 h-6" />
        </button>
        <button
          onClick={handleClear}
          className="p-2 rounded-md hover:bg-gray-100"
          title="Clear"
        >
          <Trash2 className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default WhiteboardToolbar;