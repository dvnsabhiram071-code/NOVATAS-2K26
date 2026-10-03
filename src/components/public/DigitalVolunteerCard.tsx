import React, { useRef, useState, useEffect } from 'react';
import { 
  Download, 
  CheckCircle2, 
  QrCode, 
  Check, 
  Copy, 
  Share2, 
  GraduationCap, 
  Users, 
  CreditCard, 
  Calendar, 
  ShieldCheck, 
  Phone,
  Trophy,
  Sparkles,
  Camera,
  Layers,
  Crown,
  AlertTriangle,
  Lock
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { VolunteerApplication } from '../../types';
import { generateVolunteerQRCode } from '../../utils/qrGenerator';

export const DigitalVolunteerCard: React.FC<{ 
  volunteer: VolunteerApplication;
  onViewLargeQR?: () => void;
}> = ({ volunteer, onViewLargeQR }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);

  const isApproved = volunteer.status === 'APPROVED' && !!volunteer.volunteerId;

  // Final assignments (Only active if approved)
  const volunteerId = volunteer.volunteerId || 'PENDING';
  const assignedEvent = volunteer.assignedEvent1 || 'Pending Assignment';
  const role = volunteer.volunteerRole || 'Pending Role';
  
  // Format issued date dynamically
  const issuedDate = volunteer.approvedAt 
    ? new Date(volunteer.approvedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
    : '03 OCT 2026';

  // CRITICAL RULE: Absolutely NO QR code generated before approval!
  useEffect(() => {
    let isMounted = true;
    if (isApproved && volunteer.volunteerId && volunteer.qrToken) {
      generateVolunteerQRCode({
        system: 'NOVATAS-2K26',
        volunteerId: volunteer.volunteerId,
        fullName: volunteer.fullName,
        usn: volunteer.usn,
        department: volunteer.department,
        section: volunteer.section,
        assignedEvent1: assignedEvent,
        volunteerRole: role,
        status: volunteer.status,
        qrToken: volunteer.qrToken,
        verifiedAt: new Date().toISOString()
      }).then(url => {
        if (isMounted) setQrDataUrl(url);
      });
    } else {
      setQrDataUrl('');
    }

    return () => {
      isMounted = false;
    };
  }, [volunteer, isApproved, assignedEvent, role]);

  // Safe file downloader
  const triggerDownload = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 250);
  };

  // Pure HTML5 Canvas 2D Badge Generator (Guaranteed zero-fail fallback matching exact reference)
  const drawDirectBadgeCanvas = async (): Promise<string> => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    // 1. Dark Navy Background with subtle gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1200);
    bgGrad.addColorStop(0, '#0a1024');
    bgGrad.addColorStop(0.35, '#040714');
    bgGrad.addColorStop(1, '#020308');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(10, 10, 780, 1180, 36);
    ctx.fill();

    // Outer Cyan Border with glow
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#00E5FF';
    ctx.stroke();

    // Top Multi-Color Neon Stripe
    const stripeGrad = ctx.createLinearGradient(10, 0, 790, 0);
    stripeGrad.addColorStop(0, '#00E5FF');
    stripeGrad.addColorStop(0.2, '#2979FF');
    stripeGrad.addColorStop(0.4, '#7C4DFF');
    stripeGrad.addColorStop(0.6, '#FF2BD6');
    stripeGrad.addColorStop(0.8, '#FF7A00');
    stripeGrad.addColorStop(1, '#FFE600');
    ctx.fillStyle = stripeGrad;
    ctx.beginPath();
    ctx.roundRect(10, 10, 780, 14, [36, 36, 0, 0]);
    ctx.fill();

    // 2. Watermark Quotes on left & right
    ctx.save();
    ctx.font = '900 24px sans-serif';
    ctx.fillStyle = 'rgba(0, 229, 255, 0.18)';
    ctx.textAlign = 'left';
    ctx.fillText('BE', 45, 230);
    ctx.fillText('THE', 45, 260);
    ctx.fillText('TEAM', 45, 290);

    ctx.fillStyle = 'rgba(255, 43, 214, 0.18)';
    ctx.textAlign = 'right';
    ctx.fillText('BEHIND', 755, 230);
    ctx.fillText('THE', 755, 260);
    ctx.fillText('EXPERIENCE', 755, 290);
    ctx.restore();

    // 3. NOVATAS 2K26 Header
    ctx.textAlign = 'center';
    ctx.font = '900 48px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('NOVATAS', 400, 85);

    ctx.font = 'bold 36px cursive';
    ctx.fillStyle = '#00E5FF';
    ctx.fillText('2K26', 400, 125);

    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#00E5FF';
    ctx.fillText('OFFICIAL VOLUNTEER BADGE', 400, 155);

    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('—  CSE DEPARTMENT  —', 400, 178);

    // 4. Centered Profile Photo Frame
    const photoX = 290;
    const photoY = 200;
    const photoSize = 220;

    // Gradient frame for photo
    const photoBorderGrad = ctx.createLinearGradient(photoX, photoY, photoX + photoSize, photoY + photoSize);
    photoBorderGrad.addColorStop(0, '#00E5FF');
    photoBorderGrad.addColorStop(0.5, '#7C4DFF');
    photoBorderGrad.addColorStop(1, '#FF2BD6');
    ctx.lineWidth = 6;
    ctx.strokeStyle = photoBorderGrad;
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoSize, photoSize, 28);
    ctx.stroke();

    // Photo placeholder or image draw
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = volunteer.photoUrl;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        setTimeout(resolve, 600);
      });
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(photoX + 4, photoY + 4, photoSize - 8, photoSize - 8, 24);
      ctx.clip();
      ctx.drawImage(img, photoX + 4, photoY + 4, photoSize - 8, photoSize - 8);
      ctx.restore();
    } catch {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(photoX + 4, photoY + 4, photoSize - 8, photoSize - 8, 24);
      ctx.fill();
    }

    // 5. Volunteer Name & ID
    ctx.font = '900 36px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(volunteer.fullName.toUpperCase(), 400, 470);

    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = '#00E5FF';
    ctx.fillText(volunteerId, 400, 505);

    // 6. Academic Info Row
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`CSE  |  SECTION ${volunteer.section}  |  ${volunteer.usn}`, 400, 545);

    // 7. Side-by-side glowing panels (Event & Role)
    // Left panel: Event
    ctx.fillStyle = '#0b0f19';
    ctx.beginPath();
    ctx.roundRect(70, 580, 310, 100, 20);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#fcd34d';
    ctx.textAlign = 'left';
    ctx.fillText('ASSIGNED VOLUNTEER EVENT', 95, 610);
    ctx.font = '900 24px sans-serif';
    ctx.fillStyle = '#FFE600';
    ctx.fillText(assignedEvent, 95, 650);

    // Right panel: Role
    ctx.fillStyle = '#0b0f19';
    ctx.beginPath();
    ctx.roundRect(420, 580, 310, 100, 20);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#7c4dff';
    ctx.stroke();

    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#c4b5fd';
    ctx.fillText('VOLUNTEER ROLE', 445, 610);
    ctx.font = '900 20px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(role, 445, 650);

    // 8. QR Code in centered white card
    ctx.textAlign = 'center';
    const qrSize = 190;
    const qrX = 400 - qrSize / 2;
    const qrY = 715;

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(qrX, qrY, qrSize, qrSize, 20);
    ctx.fill();

    if (qrDataUrl) {
      try {
        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        await new Promise<void>(res => {
          qrImg.onload = () => res();
          qrImg.onerror = () => res();
          setTimeout(res, 400);
        });
        ctx.drawImage(qrImg, qrX + 10, qrY + 10, qrSize - 20, qrSize - 20);
      } catch {
        // Draw placeholder text
      }
    }

    // 9. Verified & Approved Pill
    const pillY = 940;
    ctx.fillStyle = '#032e1f';
    ctx.beginPath();
    ctx.roundRect(240, pillY, 320, 48, 24);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#00D084';
    ctx.stroke();

    ctx.font = '900 17px monospace';
    ctx.fillStyle = '#00D084';
    ctx.fillText('✓ VERIFIED & APPROVED', 400, pillY + 31);

    // 10. Issued Date & Validity
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`ISSUED ON: ${issuedDate}   |   VALID FOR: NOVATAS 2K26`, 400, 1030);

    // 11. Support Contact
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#00E5FF';
    ctx.fillText('VOLUNTEER SUPPORT: D V N S ABHIRAM (8618842527)', 400, 1070);

    // 12. Bottom verification note
    ctx.font = '11px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('OFFICIAL CSE VOLUNTEER IDENTITY CARD • SCAN AT GATE FOR VERIFICATION', 400, 1120);

    return canvas.toDataURL('image/png');
  };

  // Primary Download Function with guaranteed fallback
  const handleDownloadCard = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      if (cardRef.current) {
        const canvas = await html2canvas(cardRef.current, {
          scale: 3,
          backgroundColor: '#030712',
          useCORS: true,
          allowTaint: false,
          logging: false
        });
        const dataUrl = canvas.toDataURL('image/png');
        triggerDownload(dataUrl, `NOVATAS2K26_Volunteer_${volunteerId}.png`);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3500);
      } else {
        throw new Error('Ref not ready');
      }
    } catch (err) {
      console.warn('html2canvas render issue, switching to high-fidelity direct badge generator:', err);
      try {
        const fallbackUrl = await drawDirectBadgeCanvas();
        triggerDownload(fallbackUrl, `NOVATAS2K26_Volunteer_${volunteerId}.png`);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3500);
      } catch (fallbackError) {
        console.error('All download methods failed:', fallbackError);
        alert('Could not generate card image. Please take a screenshot of your screen.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    triggerDownload(qrDataUrl, `NOVATAS2K26_QR_${volunteerId}.png`);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(volunteerId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `NOVATAS 2K26 Volunteer Card - ${volunteer.fullName}`,
          text: `Official Volunteer ID Card for ${volunteer.fullName} (${volunteerId}) - Assigned: ${assignedEvent} (${role})`,
          url
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(url);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    }
  };

  // If application is NOT approved, do not show the official active badge
  if (!isApproved) {
    return (
      <div className="w-full max-w-md mx-auto p-6 rounded-3xl bg-slate-950 border-2 border-amber-500/50 text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-display font-black text-xl text-white">
            VOLUNTEER BADGE INACTIVE
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            Digital Volunteer ID Cards and secure QR badges are issued <strong>only after Admin assigns your final event & approves your application</strong>.
          </p>
        </div>
        <div className="p-3 bg-slate-900 rounded-xl text-xs font-mono text-slate-400">
          Status: <strong className="text-amber-400">{volunteer.status}</strong> • Volunteer ID: <span className="italic">Not Generated</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      
      {/* ========================================================================= */}
      {/* THE OFFICIAL VOLUNTEER ID CARD (Exact Match to Visual Reference) */}
      {/* ========================================================================= */}
      <div 
        ref={cardRef}
        className="w-full max-w-[420px] rounded-[32px] bg-gradient-to-b from-[#0a1024] via-[#040714] to-[#020308] p-6 sm:p-7 border-2 border-[#00E5FF]/70 shadow-[0_0_35px_rgba(0,229,255,0.22)] text-center relative overflow-hidden select-none"
      >
        {/* Top Multi-Color Neon Highlight Stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#00E5FF] via-[#7C4DFF] via-[#FF2BD6] via-[#FF7A00] to-[#FFE600]" />

        {/* Tech Corner Matrix Dots & Wireframe Accents */}
        <div className="absolute top-4 left-4 grid grid-cols-2 gap-1 opacity-50">
          <span className="w-1 h-1 rounded-full bg-cyan-400" />
          <span className="w-1 h-1 rounded-full bg-cyan-400" />
          <span className="w-1 h-1 rounded-full bg-cyan-400" />
          <span className="w-1 h-1 rounded-full bg-cyan-400" />
          <span className="w-1 h-1 rounded-full bg-cyan-400" />
          <span className="w-1 h-1 rounded-full bg-cyan-400" />
        </div>
        <div className="absolute bottom-4 right-4 grid grid-cols-3 gap-1 opacity-50">
          <span className="w-1 h-1 rounded-full bg-violet-400" />
          <span className="w-1 h-1 rounded-full bg-violet-400" />
          <span className="w-1 h-1 rounded-full bg-violet-400" />
          <span className="w-1 h-1 rounded-full bg-violet-400" />
          <span className="w-1 h-1 rounded-full bg-violet-400" />
          <span className="w-1 h-1 rounded-full bg-violet-400" />
        </div>

        {/* Decorative Watermark Quotes (Left & Right) */}
        <div className="absolute left-3 top-28 font-brush text-cyan-400/20 text-xs sm:text-sm tracking-widest text-left -rotate-12 pointer-events-none leading-tight font-black select-none">
          BE<br />THE<br />TEAM
        </div>
        <div className="absolute right-3 top-28 font-brush text-fuchsia-400/20 text-xs sm:text-sm tracking-widest text-right rotate-12 pointer-events-none leading-tight font-black select-none">
          BEHIND<br />THE<br />EXPERIENCE
        </div>

        {/* TOP SECTION: NOVATAS 2K26 */}
        <div className="pt-2 mb-4 relative z-10">
          <div className="flex items-center justify-center space-x-1">
            <span className="font-display font-black text-3xl sm:text-4xl tracking-tight text-white drop-shadow-[0_0_20px_rgba(0,229,255,0.4)]">
              NOVATAS
            </span>
            <span className="font-brush text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 -rotate-3 inline-block ml-1">
              2K26
            </span>
          </div>

          <p className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] text-[#00E5FF] font-bold uppercase mt-1">
            OFFICIAL VOLUNTEER BADGE
          </p>

          <div className="flex items-center justify-center space-x-3 mt-1.5">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-cyan-500/60" />
            <span className="text-[9px] font-mono tracking-widest text-slate-300 uppercase font-semibold">
              CSE DEPARTMENT
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-cyan-500/60" />
          </div>
        </div>

        {/* PROFILE PHOTO: Large rounded-square with gradient glowing border */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 mx-auto mb-4 z-10">
          <div className="w-full h-full rounded-[26px] bg-gradient-to-tr from-[#00E5FF] via-[#7C4DFF] to-[#FF2BD6] p-[3px] shadow-[0_0_25px_rgba(0,229,255,0.35)]">
            <div className="w-full h-full rounded-[23px] overflow-hidden bg-slate-950">
              <img 
                src={volunteer.photoUrl} 
                alt={volunteer.fullName} 
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            </div>
          </div>
        </div>

        {/* VOLUNTEER NAME & ID */}
        <div className="space-y-1 mb-4 z-10 relative">
          <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wide uppercase leading-tight">
            {volunteer.fullName}
          </h3>
          <p className="font-mono text-base sm:text-lg font-black text-[#00E5FF] tracking-widest drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">
            {volunteerId}
          </p>
        </div>

        {/* ACADEMIC INFORMATION ROW */}
        <div className="flex items-center justify-center space-x-2 sm:space-x-3 text-[11px] sm:text-xs font-mono text-slate-300 mb-5 z-10 relative bg-slate-950/60 py-1.5 px-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center space-x-1">
            <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
            <span>{volunteer.department}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1">
            <Users className="w-3.5 h-3.5 text-violet-400" />
            <span>SECTION {volunteer.section}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1">
            <CreditCard className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-white font-bold">{volunteer.usn}</span>
          </div>
        </div>

        {/* TWO SIDE-BY-SIDE GLOWING PANELS (Exact Visual Match to Reference) */}
        <div className="grid grid-cols-2 gap-3 mb-5 z-10 relative">
          
          {/* Left Panel: Assigned Volunteer Event */}
          <div className="rounded-2xl p-3 bg-slate-950/90 border-2 border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.25)] text-left flex flex-col justify-between">
            <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-amber-300 font-bold block mb-1">
              ASSIGNED VOLUNTEER EVENT
            </span>
            <div className="flex items-center space-x-2 mt-0.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0">
                <Crown className="w-4 h-4 text-amber-300" />
              </div>
              <span className="font-display font-black text-sm sm:text-base text-[#FFE600] truncate">
                {assignedEvent}
              </span>
            </div>
          </div>

          {/* Right Panel: Volunteer Role */}
          <div className="rounded-2xl p-3 bg-slate-950/90 border-2 border-violet-500/70 shadow-[0_0_15px_rgba(124,77,255,0.25)] text-left flex flex-col justify-between">
            <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-violet-300 font-bold block mb-1">
              VOLUNTEER ROLE
            </span>
            <div className="flex items-center space-x-2 mt-0.5">
              <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-400/50 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-violet-300" />
              </div>
              <span className="font-display font-bold text-xs sm:text-sm text-slate-100 truncate">
                {role}
              </span>
            </div>
          </div>

        </div>

        {/* QR CODE CONTAINER (Only rendered if approved) */}
        <div className="mb-4 z-10 relative flex justify-center">
          <div className="bg-white p-3 rounded-2xl w-44 h-44 shadow-[0_0_25px_rgba(0,229,255,0.35)] flex items-center justify-center border-2 border-cyan-400/40">
            {qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="Verification QR" 
                className="w-full h-full object-contain"
              />
            ) : (
              <QrCode className="w-20 h-20 text-slate-900 animate-pulse" />
            )}
          </div>
        </div>

        {/* VERIFICATION STATUS: Large Green Pill */}
        <div className="mb-4 z-10 relative flex justify-center">
          <div className="inline-flex items-center space-x-2 px-6 py-2 rounded-full bg-[#032e1f]/90 border-2 border-[#00D084] text-[#00D084] shadow-[0_0_20px_rgba(0,208,132,0.4)]">
            <CheckCircle2 className="w-4 h-4 text-[#00D084] stroke-[2.5]" />
            <span className="font-mono text-xs sm:text-sm font-black tracking-wider uppercase">
              VERIFIED & APPROVED
            </span>
          </div>
        </div>

        {/* ISSUED ON & VALID FOR ROW */}
        <div className="flex items-center justify-center space-x-4 text-[10px] font-mono text-slate-400 mb-4 z-10 relative">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>ISSUED ON <strong className="text-white">{issuedDate}</strong></span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>VALID FOR <strong className="text-white">NOVATAS 2K26</strong></span>
          </div>
        </div>

        {/* VOLUNTEER SUPPORT CONTACT */}
        <div className="pt-3 border-t border-slate-800/80 z-10 relative">
          <div className="flex items-center justify-center space-x-2 text-[11px] font-mono text-cyan-400 font-bold">
            <Phone className="w-3.5 h-3.5 text-cyan-400" />
            <span>VOLUNTEER SUPPORT: D V N S ABHIRAM (8618842527)</span>
          </div>
          <p className="text-[9px] font-mono text-slate-500 uppercase mt-1 tracking-wider">
            OFFICIAL DIGITAL VOLUNTEER BADGE • SECURE SYSTEM VERIFIED
          </p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* ACTION CONTROLS BELOW THE CARD */}
      {/* ========================================================================= */}
      <div className="w-full max-w-[420px] mt-5 space-y-3">
        
        {/* Main Save / Download Button */}
        <button
          onClick={handleDownloadCard}
          disabled={isDownloading}
          className="w-full flex items-center justify-center space-x-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-display font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/30 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
        >
          {isDownloading ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>SAVING BADGE TO FILES...</span>
            </>
          ) : downloadSuccess ? (
            <>
              <Check className="w-5 h-5 stroke-[3]" />
              <span>SAVED SUCCESSFULLY!</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>SAVE VOLUNTEER ID</span>
            </>
          )}
        </button>

        {/* Supporting Secondary Actions */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleDownloadQR}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono font-medium transition-colors cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>SAVE QR</span>
          </button>

          <button
            onClick={handleCopyId}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono font-medium transition-colors cursor-pointer"
          >
            {copiedId ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-violet-400" />
                <span>COPY ID</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono font-medium transition-colors cursor-pointer"
          >
            {shareSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">SHARED</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-pink-400" />
                <span>SHARE</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
