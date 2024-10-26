import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const seminarId = params.id;
    console.log(`Generating QR code for seminar ID: ${seminarId}`);

    const qrCodeData = `${process.env.NEXT_PUBLIC_BASE_URL}/register/${seminarId}`;
    console.log(`QR code data: ${qrCodeData}`);

    // Generate QR code as a data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData);
    console.log('QR code generated successfully');

    return NextResponse.json({ qrCodeDataUrl });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json({ 
      error: 'Failed to generate QR code', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
