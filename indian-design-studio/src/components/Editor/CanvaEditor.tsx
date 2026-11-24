'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Save,
  Share2,
  Type,
  Square,
  Circle,
  Triangle,
  Star,
  Image as ImageIcon,
  Layers,
  Sparkles,
  QrCode,
  Palette,
  Trash2,
  Copy,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Plus,
  Check,
  ChevronLeft,
  Grid,
  FileDown
} from 'lucide-react';
import { DesignProject, DesignTemplate } from '@/types';
import { SAMPLE_TEMPLATES, PRESET_DIMENSIONS, INDIAN_ELEMENTS } from '@/lib/templatesData';
import { saveProject, getProjectById, getUploadedImages, addUploadedImage } from '@/lib/storage';
import { exportCanvasAsImage, exportCanvasAsPDF, exportCanvasAsSVG } from '@/lib/exportUtils';
import QRCode from 'qrcode';

interface CanvaEditorProps {
  initialProjectId?: string;
  initialTemplateId?: string;
  onExit?: () => void;
}

export default function CanvaEditor({
  initialProjectId,
  initialTemplateId,
  onExit,
}: CanvaEditorProps) {
  // Canvas DOM and Fabric References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fabricRef = useRef<any>(null);

  // Project state
  const [projectId, setProjectId] = useState<string>(
    initialProjectId || `proj_${Date.now()}`
  );
  const [projectTitle, setProjectTitle] = useState<string>('Untitled Indian Design');
  const [canvasWidth, setCanvasWidth] = useState<number>(1200);
  const [canvasHeight, setCanvasHeight] = useState<number>(1800);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<
    'templates' | 'elements' | 'text' | 'uploads' | 'backgrounds' | 'indian' | 'qrcode'
  >('templates');

  // History for Undo / Redo
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isHistoryProcessing = useRef<boolean>(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Selected object properties
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [fillColor, setFillColor] = useState<string>('#ffffff');
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(0);
  const [opacity, setOpacity] = useState<number>(1);
  const [fontSize, setFontSize] = useState<number>(32);
  const [fontFamily, setFontFamily] = useState<string>('Poppins');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUnderline, setIsUnderline] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // UI status
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [qrText, setQrText] = useState<string>('https://maps.google.com');

  // Save current canvas state to history
  const pushHistory = useCallback(() => {
    if (!fabricRef.current || isHistoryProcessing.current) return;
    try {
      const json = JSON.stringify(fabricRef.current.toJSON());
      const current = historyRef.current[historyIndexRef.current];
      if (json === current) return;

      const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
      newHistory.push(json);
      // Limit history to 30 steps
      if (newHistory.length > 30) newHistory.shift();

      historyRef.current = newHistory;
      historyIndexRef.current = newHistory.length - 1;

      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    } catch (e) {
      console.warn('History push warning', e);
    }
  }, []);

  // Sync selected object properties to right sidebar
  const updateSelectedObjectState = useCallback((obj: any) => {
    if (!obj) {
      setSelectedObject(null);
      return;
    }
    setSelectedObject(obj);
    setFillColor(obj.fill || '#000000');
    setStrokeColor(obj.stroke || '#000000');
    setStrokeWidth(obj.strokeWidth || 0);
    setOpacity(obj.opacity ?? 1);
    setIsLocked(Boolean(obj.lockMovementX));

    if (obj.type === 'i-text' || obj.type === 'text') {
      setFontSize(obj.fontSize || 32);
      setFontFamily(obj.fontFamily || 'Poppins');
      setTextAlign(obj.textAlign || 'left');
      setIsBold(obj.fontWeight === 'bold' || obj.fontWeight >= 600);
      setIsItalic(obj.fontStyle === 'italic');
      setIsUnderline(Boolean(obj.underline));
    }
  }, []);

  // Initialize Fabric Canvas
  useEffect(() => {
    let isMounted = true;

    async function initFabric() {
      if (typeof window === 'undefined' || !canvasRef.current) return;

      const fabricModule = await import('fabric');
      const fabric = fabricModule.fabric || (window as any).fabric;

      if (!isMounted || fabricRef.current) return;

      // Create Fabric Canvas
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: '#ffffff',
        preserveObjectStacking: true,
        selection: true,
      });

      fabricRef.current = canvas;

      // Event listeners
      canvas.on('selection:created', (e: any) => updateSelectedObjectState(e.selected?.[0]));
      canvas.on('selection:updated', (e: any) => updateSelectedObjectState(e.selected?.[0]));
      canvas.on('selection:cleared', () => updateSelectedObjectState(null));
      canvas.on('object:modified', () => pushHistory());
      canvas.on('object:added', () => pushHistory());
      canvas.on('object:removed', () => pushHistory());

      // Load initial design or template
      let loaded = false;
      if (initialProjectId) {
        const saved = getProjectById(initialProjectId);
        if (saved) {
          setProjectTitle(saved.title);
          setCanvasWidth(saved.width);
          setCanvasHeight(saved.height);
          canvas.setWidth(saved.width);
          canvas.setHeight(saved.height);
          if (saved.pages?.[0]?.canvasData) {
            canvas.loadFromJSON(saved.pages[0].canvasData, () => {
              canvas.renderAll();
              pushHistory();
            });
            loaded = true;
          }
        }
      }

      if (!loaded && initialTemplateId) {
        const tpl = SAMPLE_TEMPLATES.find((t) => t.id === initialTemplateId);
        if (tpl) {
          setProjectTitle(tpl.title);
          setCanvasWidth(tpl.width);
          setCanvasHeight(tpl.height);
          canvas.setWidth(tpl.width);
          canvas.setHeight(tpl.height);
          canvas.loadFromJSON(tpl.canvasData, () => {
            canvas.renderAll();
            pushHistory();
          });
          loaded = true;
        }
      }

      if (!loaded) {
        // Default: Load the Royal Rajasthani Hindu Wedding template
        const defaultTpl = SAMPLE_TEMPLATES[0];
        setProjectTitle(defaultTpl.title);
        setCanvasWidth(defaultTpl.width);
        setCanvasHeight(defaultTpl.height);
        canvas.setWidth(defaultTpl.width);
        canvas.setHeight(defaultTpl.height);
        canvas.loadFromJSON(defaultTpl.canvasData, () => {
          canvas.renderAll();
          pushHistory();
        });
      }

      // Load user uploads
      setUploadedImages(getUploadedImages());
    }

    initFabric();

    return () => {
      isMounted = false;
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
      }
    };
  }, [canvasHeight, canvasWidth, initialProjectId, initialTemplateId, pushHistory, updateSelectedObjectState]);

  // Adjust canvas viewport zoom to fit container nicely
  useEffect(() => {
    if (!containerRef.current || !fabricRef.current) return;
    const containerW = containerRef.current.clientWidth - 80;
    const containerH = containerRef.current.clientHeight - 80;
    if (containerW > 0 && containerH > 0) {
      const scaleX = containerW / canvasWidth;
      const scaleY = containerH / canvasHeight;
      const fitZoom = Math.min(scaleX, scaleY, 0.85);
      setZoomLevel(Math.round(fitZoom * 100) / 100);
    }
  }, [canvasWidth, canvasHeight]);

  // Apply zoom level to canvas
  const handleZoom = (newZoom: number) => {
    const clamped = Math.max(0.2, Math.min(newZoom, 3));
    setZoomLevel(Math.round(clamped * 100) / 100);
  };

  // Undo / Redo Actions
  const handleUndo = () => {
    if (!fabricRef.current || historyIndexRef.current <= 0) return;
    isHistoryProcessing.current = true;
    historyIndexRef.current -= 1;
    const json = historyRef.current[historyIndexRef.current];
    fabricRef.current.loadFromJSON(json, () => {
      fabricRef.current.renderAll();
      isHistoryProcessing.current = false;
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    });
  };

  const handleRedo = () => {
    if (!fabricRef.current || historyIndexRef.current >= historyRef.current.length - 1) return;
    isHistoryProcessing.current = true;
    historyIndexRef.current += 1;
    const json = historyRef.current[historyIndexRef.current];
    fabricRef.current.loadFromJSON(json, () => {
      fabricRef.current.renderAll();
      isHistoryProcessing.current = false;
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    });
  };

  // Add Shapes
  const addShape = async (type: 'rect' | 'circle' | 'triangle' | 'line') => {
    const fabricModule = await import('fabric');
    const fabric = fabricModule.fabric || (window as any).fabric;
    const canvas = fabricRef.current;
    if (!canvas) return;

    let shapeObj: any;
    const center = canvas.getCenter();

    if (type === 'rect') {
      shapeObj = new fabric.Rect({
        left: center.left - 100,
        top: center.top - 100,
        width: 200,
        height: 200,
        fill: '#d97706',
        rx: 8,
        ry: 8,
      });
    } else if (type === 'circle') {
      shapeObj = new fabric.Circle({
        left: center.left - 100,
        top: center.top - 100,
        radius: 100,
        fill: '#831843',
      });
    } else if (type === 'triangle') {
      shapeObj = new fabric.Triangle({
        left: center.left - 100,
        top: center.top - 100,
        width: 200,
        height: 180,
        fill: '#c2410c',
      });
    } else if (type === 'line') {
      shapeObj = new fabric.Line([center.left - 200, center.top, center.left + 200, center.top], {
        stroke: '#d4af37',
        strokeWidth: 4,
      });
    }

    if (shapeObj) {
      canvas.add(shapeObj);
      canvas.setActiveObject(shapeObj);
      canvas.renderAll();
      pushHistory();
    }
  };

  // Add Text
  const addText = async (presetType: 'heading' | 'subheading' | 'body' | 'hindi-vivah' | 'shloka') => {
    const fabricModule = await import('fabric');
    const fabric = fabricModule.fabric || (window as any).fabric;
    const canvas = fabricRef.current;
    if (!canvas) return;

    const center = canvas.getCenter();
    let textObj: any;

    if (presetType === 'heading') {
      textObj = new fabric.IText('Add Your Heading', {
        left: center.left,
        top: center.top - 50,
        originX: 'center',
        fontSize: 52,
        fill: '#1e293b',
        fontFamily: 'Poppins',
        fontWeight: 'bold',
      });
    } else if (presetType === 'subheading') {
      textObj = new fabric.IText('Add Your Subheading Here', {
        left: center.left,
        top: center.top,
        originX: 'center',
        fontSize: 32,
        fill: '#475569',
        fontFamily: 'Poppins',
        fontWeight: '600',
      });
    } else if (presetType === 'body') {
      textObj = new fabric.IText('Click here to edit this descriptive text and details.', {
        left: center.left,
        top: center.top + 50,
        originX: 'center',
        fontSize: 22,
        fill: '#334155',
        fontFamily: 'Poppins',
      });
    } else if (presetType === 'hindi-vivah') {
      textObj = new fabric.IText('॥ शुभ विवाह आमंत्रण ॥', {
        left: center.left,
        top: center.top,
        originX: 'center',
        fontSize: 56,
        fill: '#d97706',
        fontFamily: 'Rozha One',
        fontWeight: 'bold',
      });
    } else if (presetType === 'shloka') {
      textObj = new fabric.IText('वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥', {
        left: center.left,
        top: center.top,
        originX: 'center',
        textAlign: 'center',
        fontSize: 28,
        fill: '#facc15',
        fontFamily: 'Noto Sans Devanagari',
        lineHeight: 1.4,
      });
    }

    if (textObj) {
      canvas.add(textObj);
      canvas.setActiveObject(textObj);
      canvas.renderAll();
      pushHistory();
    }
  };

  // Add Indian Decorative SVG
  const addIndianElement = async (svgString: string) => {
    const fabricModule = await import('fabric');
    const fabric = fabricModule.fabric || (window as any).fabric;
    const canvas = fabricRef.current;
    if (!canvas) return;

    fabric.loadSVGFromString(svgString, (objects: any[], options: any) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      const center = canvas.getCenter();
      obj.set({
        left: center.left,
        top: center.top,
        originX: 'center',
        originY: 'center',
        scaleX: 2.5,
        scaleY: 2.5,
      });
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.renderAll();
      pushHistory();
    });
  };

  // Add QR Code
  const addQRCode = async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    try {
      const qrDataUrl = await QRCode.toDataURL(qrText || 'https://maps.google.com', {
        width: 300,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      });

      const fabricModule = await import('fabric');
      const fabric = fabricModule.fabric || (window as any).fabric;

      fabric.Image.fromURL(qrDataUrl, (img: any) => {
        const center = canvas.getCenter();
        img.set({
          left: center.left,
          top: center.top,
          originX: 'center',
          originY: 'center',
          scaleX: 0.6,
          scaleY: 0.6,
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        pushHistory();
      });
    } catch (e) {
      console.error('Failed to generate QR code:', e);
    }
  };

  // Handle Image Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const updated = addUploadedImage(dataUrl);
      setUploadedImages(updated);

      const fabricModule = await import('fabric');
      const fabric = fabricModule.fabric || (window as any).fabric;
      const canvas = fabricRef.current;
      if (!canvas) return;

      fabric.Image.fromURL(dataUrl, (img: any) => {
        const center = canvas.getCenter();
        // Scale down large images
        if (img.width > 600) {
          img.scaleToWidth(500);
        }
        img.set({
          left: center.left,
          top: center.top,
          originX: 'center',
          originY: 'center',
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        pushHistory();
      });
    };
    reader.readAsDataURL(file);
  };

  // Load a template into the canvas
  const loadTemplate = (tpl: DesignTemplate) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    setProjectTitle(tpl.title);
    setCanvasWidth(tpl.width);
    setCanvasHeight(tpl.height);
    canvas.setWidth(tpl.width);
    canvas.setHeight(tpl.height);

    canvas.loadFromJSON(tpl.canvasData, () => {
      canvas.renderAll();
      pushHistory();
    });
  };

  // Change Background Color
  const setCanvasBackground = (color: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // Check if background rect exists
    const bgObj = canvas.getObjects().find((o: any) => o.selectable === false && o.width >= canvasWidth && o.height >= canvasHeight);
    if (bgObj) {
      bgObj.set('fill', color);
    } else {
      canvas.setBackgroundColor(color, () => canvas.renderAll());
    }
    canvas.renderAll();
    pushHistory();
  };

  // Object Property Modifiers
  const updateProp = (prop: string, val: any) => {
    const canvas = fabricRef.current;
    const active = canvas?.getActiveObject();
    if (!active) return;

    active.set(prop, val);
    canvas.renderAll();
    pushHistory();
    updateSelectedObjectState(active);
  };

  // Layer Actions
  const bringForward = () => {
    const canvas = fabricRef.current;
    const active = canvas?.getActiveObject();
    if (active) {
      canvas.bringForward(active);
      canvas.renderAll();
      pushHistory();
    }
  };

  const sendBackward = () => {
    const canvas = fabricRef.current;
    const active = canvas?.getActiveObject();
    if (active) {
      canvas.sendBackwards(active);
      canvas.renderAll();
      pushHistory();
    }
  };

  const bringToFront = () => {
    const canvas = fabricRef.current;
    const active = canvas?.getActiveObject();
    if (active) {
      canvas.bringToFront(active);
      canvas.renderAll();
      pushHistory();
    }
  };

  const sendToBack = () => {
    const canvas = fabricRef.current;
    const active = canvas?.getActiveObject();
    if (active) {
      canvas.sendToBack(active);
      canvas.renderAll();
      pushHistory();
    }
  };

  const toggleLock = () => {
    const canvas = fabricRef.current;
    const active = canvas?.getActiveObject();
    if (!active) return;
    const newLock = !active.lockMovementX;
    active.set({
      lockMovementX: newLock,
      lockMovementY: newLock,
      lockRotation: newLock,
      lockScalingX: newLock,
      lockScalingY: newLock,
    });
    setIsLocked(newLock);
    canvas.renderAll();
  };

  const duplicateObject = async () => {
    const canvas = fabricRef.current;
    const active = canvas?.getActiveObject();
    if (!active) return;

    active.clone((cloned: any) => {
      cloned.set({
        left: active.left + 30,
        top: active.top + 30,
        evented: true,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      pushHistory();
    });
  };

  const deleteSelected = () => {
    const canvas = fabricRef.current;
    const active = canvas?.getActiveObject();
    if (!active) return;

    if (active.type === 'activeSelection') {
      active.forEachObject((obj: any) => canvas.remove(obj));
    } else {
      canvas.remove(active);
    }
    canvas.discardActiveObject();
    canvas.renderAll();
    setSelectedObject(null);
    pushHistory();
  };

  // Save Project
  const handleSave = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const canvasJson = canvas.toJSON();
    const thumbnail = canvas.toDataURL({ format: 'jpeg', multiplier: 0.25, quality: 0.8 });

    const project: DesignProject = {
      id: projectId,
      title: projectTitle,
      category: 'wedding',
      width: canvasWidth,
      height: canvasHeight,
      thumbnail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pages: [
        {
          id: 'page_1',
          name: 'Front Design',
          canvasData: canvasJson,
          previewThumbnail: thumbnail,
        },
      ],
    };

    saveProject(project);
    setSaveStatus('Saved!');
    setTimeout(() => setSaveStatus(''), 2500);
  };

  // Indian Palette Previews
  const INDIAN_PALETTES = [
    { name: 'Royal Crimson', hex: '#580816' },
    { name: 'Deep Maroon', hex: '#831843' },
    { name: 'Gold Leaf', hex: '#d97706' },
    { name: 'Pure Saffron', hex: '#ea580c' },
    { name: 'Peacock Teal', hex: '#0e7490' },
    { name: 'Emerald Forest', hex: '#047857' },
    { name: 'Heritage Navy', hex: '#1e3a8a' },
    { name: 'Cream Silk', hex: '#fffdf5' },
    { name: 'Charcoal Black', hex: '#18181b' },
    { name: 'Crisp White', hex: '#ffffff' },
  ];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 select-none">
      {/* 1. TOP TOOLBAR */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          {onExit ? (
            <button
              onClick={onExit}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <Link
              href="/"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
          )}

          {/* Project Title Input */}
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="text-sm font-semibold text-slate-800 border border-transparent hover:border-slate-300 focus:border-amber-500 rounded-md px-2 py-1 focus:outline-none w-48 sm:w-64 transition-all"
          />

          {/* Dimension badge */}
          <span className="hidden md:inline-flex text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            {canvasWidth} × {canvasHeight} px
          </span>
        </div>

        {/* Center: Undo, Redo, Zoom */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors ${
              !canUndo ? 'opacity-30 cursor-not-allowed' : 'hover:text-slate-900'
            }`}
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors ${
              !canRedo ? 'opacity-30 cursor-not-allowed' : 'hover:text-slate-900'
            }`}
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Zoom Controls */}
          <button
            onClick={() => handleZoom(zoomLevel - 0.1)}
            title="Zoom Out"
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-600 min-w-[42px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => handleZoom(zoomLevel + 0.1)}
            title="Zoom In"
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(0.65)}
            title="Fit to Screen"
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Print Alignment Grid"
            className={`p-1.5 rounded-lg transition-colors ${
              showGrid ? 'bg-amber-100 text-amber-800' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Save, Export, Share */}
        <div className="flex items-center gap-2">
          {saveStatus && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-pulse">
              <Check className="w-3.5 h-3.5" />
              {saveStatus}
            </span>
          )}

          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            Save
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="hidden sm:flex px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg items-center gap-1.5 shadow-xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            Share
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT NAV ICON BAR */}
        <aside className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-3 gap-2 shrink-0 z-20">
          {[
            { id: 'templates', label: 'Templates', icon: Layers },
            { id: 'elements', label: 'Shapes', icon: Square },
            { id: 'text', label: 'Text', icon: Type },
            { id: 'indian', label: 'Desi Icons', icon: Sparkles },
            { id: 'uploads', label: 'Uploads', icon: ImageIcon },
            { id: 'backgrounds', label: 'Color', icon: Palette },
            { id: 'qrcode', label: 'QR Code', icon: QrCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-all ${
                  isSelected
                    ? 'bg-amber-50 text-amber-700 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-600' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* LEFT SECONDARY DRAWER PANEL */}
        <aside className="w-72 bg-white border-r border-slate-200 overflow-y-auto shrink-0 z-10 p-4">
          {/* TAB 1: TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ready Templates
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {SAMPLE_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => loadTemplate(tpl)}
                    className="group border border-slate-200 hover:border-amber-500 rounded-xl overflow-hidden text-left p-2 hover:shadow-md transition-all bg-slate-50 hover:bg-amber-50/20"
                  >
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-200 mb-2">
                      <img
                        src={tpl.thumbnail}
                        alt={tpl.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="text-xs font-bold text-slate-800 leading-snug">
                      {tpl.title}
                    </div>
                    <span className="text-[10px] text-amber-700 font-medium">
                      {tpl.subcategory} • {tpl.language}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SHAPES & ELEMENTS */}
          {activeTab === 'elements' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Basic Shapes
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addShape('rect')}
                  className="p-3 border border-slate-200 rounded-xl hover:border-amber-500 flex flex-col items-center gap-2 hover:bg-amber-50/30 transition-all"
                >
                  <Square className="w-6 h-6 text-amber-600" />
                  <span className="text-xs font-medium text-slate-700">Rectangle</span>
                </button>
                <button
                  onClick={() => addShape('circle')}
                  className="p-3 border border-slate-200 rounded-xl hover:border-amber-500 flex flex-col items-center gap-2 hover:bg-amber-50/30 transition-all"
                >
                  <Circle className="w-6 h-6 text-rose-600" />
                  <span className="text-xs font-medium text-slate-700">Circle</span>
                </button>
                <button
                  onClick={() => addShape('triangle')}
                  className="p-3 border border-slate-200 rounded-xl hover:border-amber-500 flex flex-col items-center gap-2 hover:bg-amber-50/30 transition-all"
                >
                  <Triangle className="w-6 h-6 text-orange-600" />
                  <span className="text-xs font-medium text-slate-700">Triangle</span>
                </button>
                <button
                  onClick={() => addShape('line')}
                  className="p-3 border border-slate-200 rounded-xl hover:border-amber-500 flex flex-col items-center gap-2 hover:bg-amber-50/30 transition-all"
                >
                  <div className="w-6 h-0.5 bg-amber-600 my-auto" />
                  <span className="text-xs font-medium text-slate-700">Divider Line</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: TEXT PRESETS */}
          {activeTab === 'text' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Add Text Elements
              </h3>
              <button
                onClick={() => addText('heading')}
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-left text-sm font-bold text-slate-900 transition-colors"
              >
                Add Heading
              </button>
              <button
                onClick={() => addText('subheading')}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-left text-xs font-semibold text-slate-700 transition-colors"
              >
                Add Subheading
              </button>
              <button
                onClick={() => addText('body')}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-left text-xs text-slate-600 transition-colors"
              >
                Add Body Text
              </button>

              <div className="pt-3 border-t border-slate-200">
                <h4 className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-2">
                  Hindi & Traditional Presets
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => addText('hindi-vivah')}
                    className="w-full py-2 px-3 border border-amber-200 bg-amber-50 hover:bg-amber-100 rounded-lg text-left font-rozha text-amber-900 text-sm"
                  >
                    ॥ शुभ विवाह आमंत्रण ॥
                  </button>
                  <button
                    onClick={() => addText('shloka')}
                    className="w-full py-2 px-3 border border-amber-200 bg-amber-50 hover:bg-amber-100 rounded-lg text-left font-hindi text-amber-900 text-xs leading-relaxed"
                  >
                    वक्रतुण्ड महाकाय (Ganesh Shloka)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INDIAN DECORATIVE ICONS */}
          {activeTab === 'indian' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Indian Cultural Elements
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {INDIAN_ELEMENTS.map((elem) => (
                  <button
                    key={elem.id}
                    onClick={() => addIndianElement(elem.svg)}
                    className="p-3 border border-slate-200 hover:border-amber-500 rounded-xl flex flex-col items-center gap-2 hover:bg-amber-50/40 transition-all text-center"
                    title={elem.name}
                  >
                    <div
                      className="w-10 h-10 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: elem.svg }}
                    />
                    <span className="text-[10px] font-medium text-slate-700 leading-tight">
                      {elem.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: UPLOADS */}
          {activeTab === 'uploads' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Upload Media
              </h3>
              <label className="w-full py-3 px-4 border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl flex flex-col items-center justify-center gap-1 text-center cursor-pointer hover:bg-amber-50/20 transition-all">
                <ImageIcon className="w-6 h-6 text-amber-600" />
                <span className="text-xs font-semibold text-slate-700">Upload Image / Logo</span>
                <span className="text-[10px] text-slate-400">PNG, JPG, SVG up to 10MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {uploadedImages.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-600 mb-2">Recent Uploads</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {uploadedImages.map((src, idx) => (
                      <button
                        key={idx}
                        onClick={async () => {
                          const fabricModule = await import('fabric');
                          const fabric = fabricModule.fabric || (window as any).fabric;
                          const canvas = fabricRef.current;
                          fabric.Image.fromURL(src, (img: any) => {
                            const center = canvas.getCenter();
                            img.set({ left: center.left, top: center.top });
                            canvas.add(img);
                            canvas.setActiveObject(img);
                            canvas.renderAll();
                            pushHistory();
                          });
                        }}
                        className="aspect-square rounded-lg border border-slate-200 overflow-hidden hover:opacity-80 transition-opacity bg-slate-50"
                      >
                        <img src={src} alt="Uploaded" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: BACKGROUNDS & PALETTES */}
          {activeTab === 'backgrounds' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Indian Color Palettes
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {INDIAN_PALETTES.map((pal) => (
                  <button
                    key={pal.hex}
                    onClick={() => setCanvasBackground(pal.hex)}
                    className="p-2 border border-slate-200 hover:border-slate-400 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-all text-left"
                  >
                    <span
                      className="w-5 h-5 rounded-full shrink-0 border border-slate-300"
                      style={{ backgroundColor: pal.hex }}
                    />
                    <span className="text-[11px] font-medium text-slate-700">{pal.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: QR CODE */}
          {activeTab === 'qrcode' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Venue Google Map QR
              </h3>
              <p className="text-[11px] text-slate-500">
                Enter your Google Maps venue link or website URL. Guests scan it to navigate directly!
              </p>
              <input
                type="text"
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                placeholder="https://maps.app.goo.gl/..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={addQRCode}
                className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5"
              >
                <QrCode className="w-4 h-4" />
                Add QR Code to Canvas
              </button>
            </div>
          )}
        </aside>

        {/* 3. CENTER CANVAS WORK AREA */}
        <main
          ref={containerRef}
          className={`flex-1 overflow-auto flex items-center justify-center p-8 canvas-checkerboard ${
            showGrid ? 'print-grid' : ''
          }`}
        >
          <div
            className="transition-transform duration-100 ease-out shadow-2xl rounded-sm border border-slate-300/80 bg-white"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
            }}
          >
            <canvas ref={canvasRef} />
          </div>
        </main>

        {/* 4. RIGHT SIDEBAR PROPERTIES INSPECTOR */}
        <aside className="w-64 bg-white border-l border-slate-200 overflow-y-auto shrink-0 z-10 p-4 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {selectedObject ? `${selectedObject.type.toUpperCase()} Properties` : 'Canvas Settings'}
            </span>
            {selectedObject && (
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleLock}
                  title={isLocked ? 'Unlock Element' : 'Lock Element'}
                  className={`p-1 rounded-md transition-colors ${
                    isLocked ? 'text-rose-600 bg-rose-50' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={duplicateObject}
                  title="Duplicate (Copy)"
                  className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={deleteSelected}
                  title="Delete"
                  className="p-1 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {selectedObject ? (
            <div className="space-y-4">
              {/* TEXT PROPERTIES */}
              {(selectedObject.type === 'i-text' || selectedObject.type === 'text') && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Font Family
                    </label>
                    <select
                      value={fontFamily}
                      onChange={(e) => {
                        setFontFamily(e.target.value);
                        updateProp('fontFamily', e.target.value);
                      }}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none"
                    >
                      <option value="Poppins">Poppins (Clean Modern)</option>
                      <option value="Cinzel">Cinzel (Royal Roman)</option>
                      <option value="Rozha One">Rozha One (Traditional Hindi)</option>
                      <option value="Noto Sans Devanagari">Noto Sans Devanagari (Hindi)</option>
                      <option value="Yatra One">Yatra One (Festive Devanagari)</option>
                      <option value="Great Vibes">Great Vibes (Script/Calligraphy)</option>
                    </select>
                  </div>

                  {/* Size and Styles */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] text-slate-500 mb-0.5">Size</label>
                      <input
                        type="number"
                        value={fontSize}
                        onChange={(e) => {
                          const s = Number(e.target.value);
                          setFontSize(s);
                          updateProp('fontSize', s);
                        }}
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded-md"
                      />
                    </div>
                    <div className="flex items-end gap-1">
                      <button
                        onClick={() => {
                          const n = !isBold;
                          setIsBold(n);
                          updateProp('fontWeight', n ? 'bold' : 'normal');
                        }}
                        className={`p-1.5 rounded border ${
                          isBold ? 'bg-amber-100 border-amber-300 text-amber-800' : 'border-slate-200'
                        }`}
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const n = !isItalic;
                          setIsItalic(n);
                          updateProp('fontStyle', n ? 'italic' : 'normal');
                        }}
                        className={`p-1.5 rounded border ${
                          isItalic ? 'bg-amber-100 border-amber-300 text-amber-800' : 'border-slate-200'
                        }`}
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const n = !isUnderline;
                          setIsUnderline(n);
                          updateProp('underline', n);
                        }}
                        className={`p-1.5 rounded border ${
                          isUnderline ? 'bg-amber-100 border-amber-300 text-amber-800' : 'border-slate-200'
                        }`}
                      >
                        <Underline className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Text Alignment */}
                  <div className="flex items-center gap-1">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => {
                          setTextAlign(align);
                          updateProp('textAlign', align);
                        }}
                        className={`flex-1 py-1 text-xs rounded border flex items-center justify-center ${
                          textAlign === align
                            ? 'bg-amber-100 border-amber-300 text-amber-800'
                            : 'border-slate-200'
                        }`}
                      >
                        {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                        {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                        {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* COLOR & FILL */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Fill Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={typeof fillColor === 'string' ? fillColor : '#000000'}
                    onChange={(e) => {
                      setFillColor(e.target.value);
                      updateProp('fill', e.target.value);
                    }}
                    className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={typeof fillColor === 'string' ? fillColor : ''}
                    onChange={(e) => {
                      setFillColor(e.target.value);
                      updateProp('fill', e.target.value);
                    }}
                    className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              {/* STROKE */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Border / Stroke
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => {
                      setStrokeColor(e.target.value);
                      updateProp('stroke', e.target.value);
                    }}
                    className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
                  />
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={strokeWidth}
                    onChange={(e) => {
                      const w = Number(e.target.value);
                      setStrokeWidth(w);
                      updateProp('strokeWidth', w);
                    }}
                    className="w-16 px-2 py-1 text-xs border border-slate-300 rounded"
                    placeholder="Width"
                  />
                </div>
              </div>

              {/* OPACITY */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                  <span>Transparency</span>
                  <span>{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => {
                    const op = Number(e.target.value);
                    setOpacity(op);
                    updateProp('opacity', op);
                  }}
                  className="w-full accent-amber-600"
                />
              </div>

              {/* LAYER REORDERING */}
              <div className="pt-2 border-t border-slate-200">
                <span className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                  Layer Ordering
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={bringForward}
                    className="py-1 px-2 text-[10px] font-medium border border-slate-200 rounded hover:bg-slate-50 flex items-center justify-center gap-1"
                  >
                    <ArrowUp className="w-3 h-3" /> Forward
                  </button>
                  <button
                    onClick={sendBackward}
                    className="py-1 px-2 text-[10px] font-medium border border-slate-200 rounded hover:bg-slate-50 flex items-center justify-center gap-1"
                  >
                    <ArrowDown className="w-3 h-3" /> Backward
                  </button>
                  <button
                    onClick={bringToFront}
                    className="py-1 px-2 text-[10px] font-medium border border-slate-200 rounded hover:bg-slate-50 flex items-center justify-center gap-1"
                  >
                    <ChevronsUp className="w-3 h-3" /> To Front
                  </button>
                  <button
                    onClick={sendToBack}
                    className="py-1 px-2 text-[10px] font-medium border border-slate-200 rounded hover:bg-slate-50 flex items-center justify-center gap-1"
                  >
                    <ChevronsDown className="w-3 h-3" /> To Back
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Click any element on canvas to inspect and edit its properties.
            </div>
          )}
        </aside>
      </div>

      {/* 5. EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Export Your Design</h3>
            <p className="text-xs text-slate-500 mb-4">
              Select your required format and print resolution.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  exportCanvasAsImage(fabricRef.current, {
                    format: 'png',
                    multiplier: 2,
                    filename: projectTitle,
                  });
                  setShowExportModal(false);
                }}
                className="w-full p-3 border border-slate-200 hover:border-amber-500 rounded-xl text-left flex items-center justify-between hover:bg-amber-50/20 transition-all"
              >
                <div>
                  <span className="block font-semibold text-xs text-slate-900">
                    High Resolution PNG (HD)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Crisp background transparency, ideal for web and WhatsApp
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[10px] bg-slate-100 rounded font-mono">PNG</span>
              </button>

              <button
                onClick={() => {
                  exportCanvasAsImage(fabricRef.current, {
                    format: 'jpeg',
                    multiplier: 2,
                    quality: 0.95,
                    filename: projectTitle,
                  });
                  setShowExportModal(false);
                }}
                className="w-full p-3 border border-slate-200 hover:border-amber-500 rounded-xl text-left flex items-center justify-between hover:bg-amber-50/20 transition-all"
              >
                <div>
                  <span className="block font-semibold text-xs text-slate-900">
                    Standard JPG Image
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Smaller file size, perfect for fast social media sharing
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[10px] bg-slate-100 rounded font-mono">JPG</span>
              </button>

              <button
                onClick={() => {
                  exportCanvasAsPDF(fabricRef.current, {
                    filename: projectTitle,
                    dpi: 300,
                    includeCropMarks: true,
                  });
                  setShowExportModal(false);
                }}
                className="w-full p-3 border-2 border-amber-500 bg-amber-50/30 rounded-xl text-left flex items-center justify-between hover:bg-amber-100/40 transition-all"
              >
                <div>
                  <span className="block font-bold text-xs text-amber-900">
                    Print-Ready 300 DPI PDF (With Crop Marks)
                  </span>
                  <span className="text-[10px] text-amber-700">
                    Commercial printing press quality with alignment crop lines
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[10px] bg-amber-200 text-amber-900 rounded font-bold">
                  PDF
                </span>
              </button>

              <button
                onClick={() => {
                  exportCanvasAsSVG(fabricRef.current, projectTitle);
                  setShowExportModal(false);
                }}
                className="w-full p-3 border border-slate-200 hover:border-amber-500 rounded-xl text-left flex items-center justify-between hover:bg-amber-50/20 transition-all"
              >
                <div>
                  <span className="block font-semibold text-xs text-slate-900">
                    Vector Graphic (SVG)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Scalable vector format for laser cutting and high-end print
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[10px] bg-slate-100 rounded font-mono">SVG</span>
              </button>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. SHARE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center">
            <h3 className="text-base font-bold text-slate-900 mb-1">Share Invitation / Design</h3>
            <p className="text-xs text-slate-500 mb-5">
              Instantly share this design with family, friends, or clients on WhatsApp.
            </p>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `Hey! Please check out this Indian Design Studio invitation: ${projectTitle}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 mb-3"
            >
              Share via WhatsApp
            </a>

            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert('Project URL copied to clipboard!');
                setShowShareModal(false);
              }}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl"
            >
              Copy Shareable Link
            </button>

            <button
              onClick={() => setShowShareModal(false)}
              className="mt-4 text-xs text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
