
import React, { useState, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Wand2, 
  Upload, 
  Loader2, 
  Sparkles, 
  RefreshCw, 
  Download, 
  Camera, 
  Trash2, 
  ArrowRight, 
  CameraOff, 
  X, 
  Zap, 
  CheckCircle2, 
  Smartphone, 
  ScanLine,
  Search,
  AlertCircle
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { editImageWithGemini } from '../geminiService';

const ImageLab: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'edit' | 'scan'>('edit');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Effect to handle video stream binding after component mount/update
  useEffect(() => {
    if (showCamera && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [showCamera, cameraStream]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setCameraStream(stream);
      setShowCamera(true);
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        
        if (activeMode === 'scan') {
          handleIdentifyPill(dataUrl);
        } else {
          setSelectedImage(dataUrl);
          setEditedImage(null);
        }
        stopCamera();
      }
    }
  };

  const handleIdentifyPill = async (imageData: string) => {
    setLoading(true);
    setScanResult(null);
    setSelectedImage(imageData);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: imageData.split(',')[1],
                mimeType: 'image/jpeg',
              },
            },
            {
              text: "Identify this medication pill or packaging. Tell me the name, common dosage, and what it is typically used for. Format the response clearly with headers. Include a medical disclaimer.",
            },
          ],
        },
      });
      setScanResult(response.text || "Could not identify the medication. Please ensure the label is clearly visible.");
    } catch (err) {
      console.error("Pill identification error:", err);
      setScanResult("An error occurred during identification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setEditedImage(null);
        setScanResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!selectedImage || !prompt.trim() || loading) return;

    setLoading(true);
    try {
      const mimeType = selectedImage.substring(selectedImage.indexOf(":") + 1, selectedImage.indexOf(";"));
      const result = await editImageWithGemini(selectedImage, mimeType, prompt);
      if (result) {
        setEditedImage(result);
      } else {
        alert("Nano Banana couldn't produce an image for this prompt.");
      }
    } catch (error) {
      console.error("Image editing error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setSelectedImage(null);
    setEditedImage(null);
    setScanResult(null);
    setPrompt('');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-200 dark:shadow-none animate-bounce">
            <Zap className="w-8 h-8 text-white fill-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-none">
              Nano <span className="text-yellow-500">Banana</span> Lab
            </h2>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-[0.2em] flex items-center gap-1">
              {activeMode === 'edit' ? 'Creative Editor' : 'Pill Identifier'} <Sparkles className="w-3 h-3 text-yellow-400" />
            </p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          <button 
            onClick={() => { setActiveMode('edit'); clear(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${activeMode === 'edit' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            <Wand2 className="w-4 h-4" />
            EDIT
          </button>
          <button 
            onClick={() => { setActiveMode('scan'); clear(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${activeMode === 'scan' ? 'bg-white dark:bg-slate-700 text-green-600 shadow-sm' : 'text-slate-500'}`}
          >
            <ScanLine className="w-4 h-4" />
            SCAN
          </button>
        </div>
      </header>

      {!selectedImage && !showCamera ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white dark:bg-slate-800 border-4 border-dashed border-slate-200 dark:border-slate-700 rounded-[3rem] p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:border-yellow-400 hover:bg-yellow-50/30 transition-all group shadow-sm"
          >
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform">
              <Upload className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Upload Image</h3>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>

          <div 
            onClick={startCamera}
            className={`bg-white dark:bg-slate-800 border-4 border-dashed border-slate-200 dark:border-slate-700 rounded-[3rem] p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-green-50/30 transition-all group shadow-sm ${activeMode === 'scan' ? 'hover:border-green-400' : 'hover:border-yellow-400'}`}
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${activeMode === 'scan' ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600'}`}>
              <Camera className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{activeMode === 'scan' ? 'Identify Pill' : 'Snap Photo'}</h3>
          </div>
        </div>
      ) : showCamera ? (
        <div className="bg-slate-900 rounded-[3rem] overflow-hidden relative aspect-square sm:aspect-video flex items-center justify-center shadow-2xl animate-fade-in border-8 border-slate-800">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Scanning Animation */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent absolute top-0 animate-[scan_3s_linear_infinite] shadow-[0_0_15px_rgba(74,222,128,0.8)]"></div>
          </div>

          <style>{`
            @keyframes scan {
              0% { top: 0%; opacity: 0; }
              5% { opacity: 1; }
              95% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
          `}</style>
          
          <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6">
            <button 
              onClick={stopCamera}
              className="p-5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/20"
            >
              <X className="w-6 h-6" />
            </button>
            <button 
              onClick={capturePhoto}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-8 border-white/30 shadow-2xl hover:scale-110 active:scale-90 transition-all group"
            >
              <div className={`w-12 h-12 rounded-full transition-colors ${activeMode === 'scan' ? 'bg-green-500' : 'bg-slate-900 group-hover:bg-yellow-500'}`} />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="relative rounded-[3rem] overflow-hidden border-8 border-white dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-800 group">
              <img src={selectedImage!} alt="Input" className="w-full h-auto max-h-[500px] object-contain" />
              <button 
                onClick={clear}
                className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {activeMode === 'edit' && (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-lg space-y-6">
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                  <Wand2 className="w-6 h-6" />
                  <h4 className="font-black uppercase text-sm tracking-widest">Nano Instructions</h4>
                </div>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Tell Nano Banana what to change..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-3xl px-6 py-5 text-sm font-medium text-slate-900 dark:text-white focus:ring-4 focus:ring-yellow-400/20 outline-none h-32 resize-none transition-all"
                />
                <button 
                  onClick={handleEdit}
                  disabled={loading || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 text-white py-5 rounded-3xl font-black shadow-2xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Sparkles className="w-6 h-6" /> <span>APPLY AI MAGIC</span></>}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {activeMode === 'edit' ? (
              <div className="relative rounded-[3rem] overflow-hidden border-8 border-white dark:border-slate-800 shadow-2xl bg-slate-100 dark:bg-slate-900 min-h-[400px] flex items-center justify-center">
                {editedImage ? (
                  <img src={editedImage} alt="Edited" className="w-full h-auto max-h-[600px] object-contain animate-fade-in" />
                ) : (
                  <div className="text-center p-12 space-y-6">
                    <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-200 dark:text-slate-700 shadow-inner">
                      <Zap className="w-12 h-12" />
                    </div>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Awaiting Generation</p>
                  </div>
                )}
                {editedImage && (
                  <div className="absolute top-4 left-4 bg-green-500 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg">
                    Result Ready
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-[3.5rem] p-8 border-8 border-white dark:border-slate-800 shadow-2xl min-h-[400px]">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-6 py-20">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-green-100 dark:border-slate-700 rounded-full"></div>
                      <div className="w-20 h-20 border-t-4 border-green-500 rounded-full absolute inset-0 animate-spin"></div>
                    </div>
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">Analyzing Medicine...</p>
                  </div>
                ) : scanResult ? (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="w-6 h-6" />
                      <h4 className="font-black text-xl uppercase tracking-tight">Identification Complete</h4>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                      <div className="prose prose-slate dark:prose-invert prose-sm max-w-none">
                        {scanResult.split('\n').map((line, i) => (
                          <p key={i} className="mb-2 text-slate-700 dark:text-slate-300 font-medium">{line}</p>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                      <p className="text-[10px] text-amber-800 dark:text-amber-500 font-bold uppercase leading-tight">
                        Always verify with a healthcare professional before taking any medication.
                      </p>
                    </div>
                    <button 
                      onClick={startCamera}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-100 hover:bg-green-700 transition-all"
                    >
                      <RefreshCw className="w-5 h-5" />
                      RE-SCAN PILL
                    </button>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                    <Search className="w-16 h-16 text-slate-100 dark:text-slate-700" />
                    <p className="text-slate-400 font-bold text-sm">Capture a pill to identify it</p>
                  </div>
                )}
              </div>
            )}

            {editedImage && (
              <a 
                href={editedImage}
                download="nano-banana-edit.png"
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-[2rem] font-black shadow-2xl flex items-center justify-center space-x-3"
              >
                <Download className="w-6 h-6" />
                <span>SAVE MASTERPIECE</span>
              </a>
            )}
          </div>
        </div>
      )}
      
      <footer className="text-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem]">
        <div className="flex items-center justify-center gap-4 text-slate-300 dark:text-slate-600">
           <Smartphone className="w-5 h-5" />
           <div className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em]">
             {activeMode === 'edit' ? 'Image Intelligence Active' : 'Pill Identification Ready'}
           </p>
           <div className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
           <Zap className="w-5 h-5" />
        </div>
      </footer>
    </div>
  );
};

export default ImageLab;
