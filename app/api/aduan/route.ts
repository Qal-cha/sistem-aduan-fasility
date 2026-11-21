import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  isValidKategori,
  isValidKeutamaan,
  isValidStatus,
  KATEGORI_OPTIONS,
  KEUTAMAAN_OPTIONS,
  STATUS_OPTIONS,
} from '@/lib/aduan';

export const dynamic = 'force-dynamic';

function getDatabaseErrorResponse(error: unknown) {
  console.error('Database error in /api/aduan:', error);
  const message =
    error instanceof Error ? error.message : 'Ralat pelayan pangkalan data.';

  if (
    message.includes('Environment variable not found: DATABASE_URL') ||
    message.includes("Can't reach database server") ||
    message.includes('ECONNREFUSED')
  ) {
    return NextResponse.json(
      {
        error:
          'Pangkalan data PostgreSQL tidak dapat dihubungi. Sila pastikan DATABASE_URL dikonfigurasi dengan betul.',
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    { error: 'Berlaku ralat semasa memproses data aduan.' },
    { status: 500 }
  );
}

export async function GET() {
  try {
    const aduan = await prisma.aduan.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    return NextResponse.json(aduan, { status: 200 });
  } catch (error) {
    return getDatabaseErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Format JSON tidak sah.' },
      { status: 400 }
    );
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { error: 'Data permohonan tidak sah.' },
      { status: 400 }
    );
  }

  const payload = body as Record<string, unknown>;
  const pengadu =
    typeof payload.pengadu === 'string' ? payload.pengadu.trim() : '';
  const lokasi =
    typeof payload.lokasi === 'string' ? payload.lokasi.trim() : '';
  const kategori_kerosakan = payload.kategori_kerosakan;
  const tahap_keutamaan = payload.tahap_keutamaan;
  const status = payload.status === undefined ? 'Baru' : payload.status;

  const errors: string[] = [];

  if (pengadu.length < 2 || pengadu.length > 120) {
    errors.push('Nama pengadu mesti antara 2 hingga 120 aksara.');
  }
  if (lokasi.length < 2 || lokasi.length > 160) {
    errors.push('Lokasi atau nama bilik mesti antara 2 hingga 160 aksara.');
  }
  if (!isValidKategori(kategori_kerosakan)) {
    errors.push(
      `Kategori kerosakan tidak sah. Pilihan dibenarkan: ${KATEGORI_OPTIONS.join(', ')}.`
    );
  }
  if (!isValidKeutamaan(tahap_keutamaan)) {
    errors.push(
      `Tahap keutamaan tidak sah. Pilihan dibenarkan: ${KEUTAMAAN_OPTIONS.join(', ')}.`
    );
  }
  if (!isValidStatus(status)) {
    errors.push(
      `Status tidak sah. Pilihan dibenarkan: ${STATUS_OPTIONS.join(', ')}.`
    );
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { error: errors[0], details: errors },
      { status: 400 }
    );
  }

  try {
    const created = await prisma.aduan.create({
      data: {
        pengadu,
        lokasi,
        kategori_kerosakan: kategori_kerosakan as string,
        tahap_keutamaan: tahap_keutamaan as string,
        status: status as string,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return getDatabaseErrorResponse(error);
  }
}
