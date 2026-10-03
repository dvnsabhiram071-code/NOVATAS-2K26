import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Camera, 
  ShieldCheck, 
  AlertCircle,
  Sparkles,
  Upload,
  RefreshCw,
  Video,
  VideoOff,
  SwitchCamera,
  Play,
  Check
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useApp } from '../../context/AppContext';
import { VolunteerApplication } from '../../types';

export const QRCheckIn: React.FC = () => {
  const { checkInVolunteer, applications } = useApp();

  const [inputCode, setInputCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    volunteer?: VolunteerApplication;
    message: string;
  } | null>(null);

  // Real Camera Scanner State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isStartingCamera, setIsStartingCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [isProcessingScan, setIsProcessingScan] = useState<boolean>(false);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to extract Volunteer ID or USN from any scanned QR text (URL, JSON, or plain ID)
  const extractIdFromScannedText = (raw: string): string => {
    let text = raw.trim();
    
    // 1. Check if it's a URL like /verify/NVT26-V00492-sec-9842a1 or https://.../verify/...
    if (text.includes('/verify/')) {
      const parts = text.split('/verify/')[1] || '';
      // Extract Volunteer ID format NVT26-V... or alphanumeric USN
      const vMatch = parts.match(/NVT26-V\d+/i);
      if (vMatch) return vMatch[0];

      // Extract before '-sec' or '-'
      const cleanToken = parts.split('-sec')[0] || parts.split('-')[0];
      if (cleanToken) return cleanToken;
    }

    // 2. Check if it's a JSON payload
    if (text.startsWith('{') && text.endsWith('}')) {
      try {
        const parsed = JSON.parse(text);
        if (parsed.volunteerId) return parsed.volunteerId;
        if (parsed.usn) return parsed.usn;
      } catch {
        // Fallback to raw text
      }
    }

    return text;
  };

  const handleVerify = (codeToTest?: string) => {
    const raw = codeToTest || inputCode;
    if (!raw.trim()) return;

    const parsedIdentifier = extractIdFromScannedText(raw);
    const res = checkInVolunteer(parsedIdentifier);
    setVerificationResult(res);

    if (res.success) {
      // Audio feedback chime
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } catch {
        // Audio not allowed or unavailable
      }
    }
  };

  // Start real webcam/camera scanning with bulletproof camera detection
  const startCamera = async (overrideCameraId?: string) => {
    setCameraError('');
    setIsStartingCamera(true);
    setIsCameraActive(true);

    // Give DOM a frame to render the #qr-reader element
    setTimeout(async () => {
      try {
        // Clean up previous instance if any
        if (scannerRef.current) {
          try {
            if (scannerRef.current.isScanning) {
              await scannerRef.current.stop();
            }
            await scannerRef.current.clear();
          } catch {
            // ignore cleanup error
          }
        }

        const html5QrCode = new Html5Qrcode('qr-reader');
        scannerRef.current = html5QrCode;

        // Query available video devices
        let devices: Array<{ id: string; label: string }> = [];
        try {
          devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            setAvailableCameras(devices);
          }
        } catch (camListErr) {
          console.warn('Could not list cameras ahead of time:', camListErr);
        }

        let cameraConfig: string | MediaTrackConstraints = { facingMode: { ideal: 'environment' } };

        if (overrideCameraId) {
          cameraConfig = overrideCameraId;
          setSelectedCameraId(overrideCameraId);
        } else if (devices && devices.length > 0) {
          // Look for rear/environment camera on phones, else default to first camera (laptop/webcam)
          const backCam = devices.find(d => 
            d.label.toLowerCase().includes('back') || 
            d.label.toLowerCase().includes('rear') || 
            d.label.toLowerCase().includes('environment')
          );
          const activeCam = backCam || devices[0];
          cameraConfig = activeCam.id;
          setSelectedCameraId(activeCam.id);
        }

        await html5QrCode.start(
          cameraConfig,
          {
            fps: 15,
            qrbox: { width: 260, height: 260 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            // Success callback on valid QR scan
            handleVerify(decodedText);
          },
          () => {
            // Frame parse error (normal while hunting for QR code in camera view)
          }
        );

        setIsStartingCamera(false);
      } catch (err: unknown) {
        console.error('Failed to start camera scanner:', err);
        setIsStartingCamera(false);
        const errMessage = err instanceof Error ? err.message : String(err);
        
        // If exact camera id failed, attempt generic user fallback
        try {
          if (scannerRef.current && !scannerRef.current.isScanning) {
            await scannerRef.current.start(
              { facingMode: 'user' },
              { fps: 15, qrbox: { width: 260, height: 260 } },
              (decoded) => handleVerify(decoded),
              () => {}
            );
            return;
          }
        } catch (fallbackErr) {
          console.warn('Fallback also failed:', fallbackErr);
        }

        setCameraError(
          errMessage.includes('NotAllowedError') || errMessage.includes('Permission')
            ? 'Camera permission denied. Please click the lock icon in your browser address bar and allow camera access.'
            : errMessage.includes('NotFoundError') || errMessage.includes('Devices not found')
            ? 'No camera found on this device. You can use "Upload QR Image" or enter the Volunteer ID manually.'
            : `Camera error: ${errMessage}. Please use "Upload QR Image" or Manual Entry below.`
        );
        setIsCameraActive(false);
      }
    }, 200);
  };

  // Switch camera between front and back
  const handleSwitchCamera = async () => {
    if (availableCameras.length < 2) return;
    const currentIndex = availableCameras.findIndex(c => c.id === selectedCameraId);
    const nextCamera = availableCameras[(currentIndex + 1) % availableCameras.length];
    await stopCamera();
    await startCamera(nextCamera.id);
  };

  // Stop camera scanning
  const stopCamera = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    scannerRef.current = null;
    setIsCameraActive(false);
    setIsStartingCamera(false);
  };

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // Handle scanning directly from an uploaded QR badge image
  const handleScanFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingScan(true);
    setCameraError('');

    try {
      const html5QrCode = new Html5Qrcode('qr-file-reader-hidden');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleVerify(decodedText);
      html5QrCode.clear();
    } catch (err) {
      console.warn('Could not read QR from file:', err);
      setCameraError('No readable QR code found in the selected file. Please make sure the QR code is clearly visible or enter the Volunteer ID manually.');
    } finally {
      setIsProcessingScan(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const recentCheckins = applications
    .filter(a => !a.isDeleted && a.checkedIn)
    .sort((a, b) => (b.checkedInAt || '').localeCompare(a.checkedInAt || ''));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hidden container for file scanning */}
      <div id="qr-file-reader-hidden" className="hidden" />

      {/* Header */}
      <div>
        <h2 className="font-display font-black text-2xl text-white tracking-wide">
          QR CODE CHECK-IN & ACCREDITATION
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Scan volunteer digital badges using your device camera, upload a badge screenshot, or lookup by Volunteer ID.
        </p>
      </div>

      {/* Main Check-in Console */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Col: Optical Scanner + Manual Input */}
        <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  VOLUNTEER VERIFICATION
                </h3>
                <p className="text-[10px] font-mono text-cyan-400">LIVE OPTICAL SCANNER DESK</p>
              </div>
            </div>

            {isCameraActive && (
              <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-[10px] font-mono font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>CAMERA LIVE</span>
              </span>
            )}
          </div>

          {/* Real Optical Camera Scanner Box */}
          <div className="border-2 border-dashed border-cyan-500/40 rounded-3xl p-5 text-center bg-slate-900/60 relative overflow-hidden transition-all">
            
            {/* When Camera is ACTIVE */}
            {isCameraActive ? (
              <div className="space-y-4">
                <div className="relative mx-auto max-w-sm rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_25px_rgba(0,229,255,0.35)] bg-black">
                  
                  {/* html5-qrcode live video mounts here */}
                  <div id="qr-reader" className="w-full min-h-[280px] bg-black" />

                  {/* Loading indicator when camera is booting up */}
                  {isStartingCamera && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center space-y-3 z-10">
                      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-mono text-cyan-300">Requesting camera access...</p>
                    </div>
                  )}

                  {/* Animated laser scan line overlay */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-56 h-56 border-2 border-cyan-400/80 rounded-2xl relative">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_12px_#00E5FF] animate-bounce" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {availableCameras.length > 1 && (
                    <button
                      onClick={handleSwitchCamera}
                      className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs font-bold rounded-xl transition-all border border-slate-700"
                    >
                      <SwitchCamera className="w-4 h-4" />
                      <span>FLIP CAMERA</span>
                    </button>
                  )}

                  <button
                    onClick={stopCamera}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase rounded-xl transition-all shadow-md shadow-rose-600/30"
                  >
                    <VideoOff className="w-4 h-4" />
                    <span>STOP CAMERA</span>
                  </button>
                </div>
              </div>
            ) : (
              /* When Camera is INACTIVE: Showcase big clickable trigger */
              <div className="py-6 space-y-4">
                <div 
                  onClick={() => startCamera()}
                  className="cursor-pointer group hover:scale-105 transition-transform"
                >
                  <div className="w-20 h-20 rounded-3xl bg-cyan-950/60 border-2 border-cyan-500/50 text-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/25 group-hover:border-cyan-300 group-hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] transition-all">
                    <Camera className="w-10 h-10 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-display font-bold text-lg text-white">
                    LIVE CAMERA OPTICAL SCANNER
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Hold the volunteer's phone badge or printed ID card in front of your camera lens.
                  </p>
                </div>

                {cameraError && (
                  <div className="p-3.5 bg-rose-950/60 border border-rose-700 rounded-xl text-xs text-rose-300 text-left flex items-start space-x-2.5 shadow-md">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-rose-200">Camera Notice:</p>
                      <p>{cameraError}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => startCamera()}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-6 py-3.5 bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-500/30 active:scale-95 cursor-pointer"
                  >
                    <Video className="w-4 h-4 text-black stroke-[2.5]" />
                    <span>OPEN CAMERA SCANNER</span>
                  </button>

                  {/* Upload QR screenshot option */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleScanFile}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingScan}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span>{isProcessingScan ? 'SCANNING FILE...' : 'UPLOAD QR IMAGE'}</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Manual Input Form */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <label className="block text-xs font-mono uppercase text-slate-300">
              OR ENTER VOLUNTEER ID / USN MANUALLY
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. NVT26-V00492 or KUB25CSE052"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm uppercase focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => handleVerify()}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-500/20 shrink-0 cursor-pointer"
              >
                VERIFY
              </button>
            </div>

            {/* Quick test buttons for instant 1-click verification */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                ⚡ Instant Simulation Test (No camera needed):
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => { setInputCode('NVT26-V00492'); handleVerify('NVT26-V00492'); }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/80 text-xs font-mono font-bold transition-all cursor-pointer flex items-center space-x-1"
                >
                  <Play className="w-3 h-3 text-cyan-400 fill-current" />
                  <span>Scan Abhiram (NVT26-V00492)</span>
                </button>
                <button
                  onClick={() => { setInputCode('NVT26-V0482'); handleVerify('NVT26-V0482'); }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700 text-xs font-mono transition-all cursor-pointer flex items-center space-x-1"
                >
                  <Play className="w-3 h-3 text-slate-400 fill-current" />
                  <span>Scan Rahul (NVT26-V0482)</span>
                </button>
                <button
                  onClick={() => { setInputCode('KUB25CSE052'); handleVerify('KUB25CSE052'); }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700 text-xs font-mono transition-all cursor-pointer flex items-center space-x-1"
                >
                  <Play className="w-3 h-3 text-slate-400 fill-current" />
                  <span>Scan by USN</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Live Verification Status */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-white">
                LIVE VERIFICATION STATUS
              </h3>
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">REAL-TIME</span>
            </div>

            {!verificationResult ? (
              <div className="py-20 text-center space-y-3 text-slate-500">
                <ShieldCheck className="w-16 h-16 mx-auto text-slate-700" />
                <p className="text-xs font-mono">No badge scanned yet. Awaiting QR code or ID lookup.</p>
              </div>
            ) : verificationResult.success && verificationResult.volunteer ? (
              <div className="space-y-4 animate-in fade-in">
                
                {/* Result header */}
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between shadow-[0_0_20px_rgba(0,208,132,0.15)]">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-emerald-400 text-base">
                        ✓ VERIFIED & APPROVED
                      </h4>
                      <p className="text-xs text-slate-300 font-mono">
                        {verificationResult.volunteer.volunteerId}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Check-in Time</span>
                    <span className="font-mono text-sm font-bold text-white">
                      {verificationResult.volunteer.checkedInAt || '10:42 AM'}
                    </span>
                  </div>
                </div>

                {/* Volunteer profile preview */}
                <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <img
                    src={verificationResult.volunteer.photoUrl}
                    alt={verificationResult.volunteer.fullName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shrink-0"
                  />
                  <div>
                    <h5 className="font-display font-black text-lg text-white">
                      {verificationResult.volunteer.fullName}
                    </h5>
                    <p className="font-mono text-xs text-slate-300">
                      {verificationResult.volunteer.department} • Section {verificationResult.volunteer.section}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      USN: {verificationResult.volunteer.usn}
                    </p>
                  </div>
                </div>

                {/* Assigned duty */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    ASSIGNED VOLUNTEER EVENT
                  </span>
                  <p className="font-display font-black text-xl text-yellow-400">
                    {verificationResult.volunteer.assignedEvent1 || 'Chess'}
                  </p>
                  <p className="text-xs font-mono text-violet-300 font-semibold pt-1">
                    Role: {verificationResult.volunteer.volunteerRole || 'Event Coordination'}
                  </p>
                </div>

                {/* Status confirmation */}
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-xl text-center">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    ✓ CHECKED IN • ACCREDITED FOR FESTIVAL ENTRY
                  </span>
                </div>

              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-center space-y-3 animate-in fade-in">
                <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
                <h4 className="font-display font-bold text-base text-rose-300 uppercase">
                  VERIFICATION FAILED
                </h4>
                <p className="text-xs text-slate-300">{verificationResult.message}</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recent Check-ins History Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-display font-bold text-base text-white">
              RECENTLY CHECKED-IN VOLUNTEERS
            </h3>
            <p className="text-xs text-slate-400">Total {recentCheckins.length} volunteers accredited and verified on site</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentCheckins.map((vol) => (
            <div
              key={vol.id}
              className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={vol.photoUrl}
                  alt={vol.fullName}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                />
                <div>
                  <p className="font-display font-bold text-xs text-white">{vol.fullName}</p>
                  <p className="text-[10px] font-mono text-cyan-400 font-bold">{vol.volunteerId}</p>
                  <p className="text-[10px] font-mono text-slate-400">{vol.assignedEvent1}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold block">
                  PRESENT
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                  {vol.checkedInAt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
