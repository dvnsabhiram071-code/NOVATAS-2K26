import QRCode from 'qrcode';

export interface QRVerificationPayload {
  system: string;
  volunteerId: string;
  fullName: string;
  usn: string;
  department: string;
  section: string;
  assignedEvent1?: string;
  assignedEvent2?: string;
  volunteerRole?: string;
  status: string;
  qrToken?: string;
  verifiedAt: string;
}

/**
 * Generate a data URL for QR code pointing to official secure verification URL
 * /verify/{volunteerId}-{token} as required by security specifications
 */
export async function generateVolunteerQRCode(payload: QRVerificationPayload | string): Promise<string> {
  try {
    let targetUrl: string;
    
    if (typeof payload === 'string') {
      targetUrl = payload;
    } else {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://novatas2k26.com';
      const token = payload.qrToken || 'sec-pass';
      targetUrl = `${baseUrl}/verify/${payload.volunteerId}-${token}`;
    }

    const dataUrl = await QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 400,
      color: {
        dark: '#030712',
        light: '#FFFFFF'
      }
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR Code:', err);
    return await QRCode.toDataURL(typeof payload === 'string' ? payload : payload.volunteerId || 'NOVATAS-2K26');
  }
}
