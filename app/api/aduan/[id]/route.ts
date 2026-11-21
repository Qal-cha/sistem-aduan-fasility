import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
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

function parseId(rawId: string): number | null {
  if (!/^\d+$/.test(rawId)) return null;
  const parsed = Number.parseInt(rawId, 10);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

function handleError(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  ) {
    return NextResponse.json(
      { error: 'Rekod aduan tidak dijumpai.' },
      { status: 404 }
    );
  }

  console.error('Database error in /api/aduan/[id]:', error);
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
    { error: 'Berlaku ralat semasa mengemas kini rekod aduan.' },
    { status: 500 }
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = parseId(id);

  if (numericId === null) {
    return NextResponse.json(
      { error: 'ID aduan tidak sah.' },
      { status: 400 }
    );
  }

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
      { error: 'Data kemas kini tidak sah.' },
      { status: 400 }
    );
  }

  const payload = body as Record<string, unknown>;
  const updateData: {
    pengadu?: string;
    lokasi?: string;
    kategori_kerosakan?: string;
    tahap_keutamaan?: string;
    status?: string;
  } = {};
  const errors: string[] = [];

  if (payload.pengadu !== undefined) {
    const pengadu =
      typeof payload.pengadu === 'string' ? payload.pengadu.trim() : '';
    if (pengadu.length < 2 || pengadu.length > 120) {
      errors.push('Nama pengadu mesti antara 2 hingga 120 aksara.');
    } else {
      updateData.pengadu = pengadu;
    }
  }

  if (payload.lokasi !== undefined) {
    const lokasi =
      typeof payload.lokasi === 'string' ? payload.lokasi.trim() : '';
    if (lokasi.length < 2 || lokasi.length > 160) {
      errors.push('Lokasi atau nama bilik mesti antara 2 hingga 160 aksara.');
    } else {
      updateData.lokasi = lokasi;
    }
  }

  if (payload.kategori_kerosakan !== undefined) {
    if (!isValidKategori(payload.kategori_kerosakan)) {
      errors.push(
        `Kategori kerosakan tidak sah. Pilihan dibenarkan: ${KATEGORI_OPTIONS.join(', ')}.`
      );
    } else {
      updateData.kategori_kerosakan = payload.kategori_kerosakan;
    }
  }

  if (payload.tahap_keutamaan !== undefined) {
    if (!isValidKeutamaan(payload.tahap_keutamaan)) {
      errors.push(
        `Tahap keutamaan tidak sah. Pilihan dibenarkan: ${KEUTAMAAN_OPTIONS.join(', ')}.`
      );
    } else {
      updateData.tahap_keutamaan = payload.tahap_keutamaan;
    }
  }

  if (payload.status !== undefined) {
    if (!isValidStatus(payload.status)) {
      errors.push(
        `Status tidak sah. Pilihan dibenarkan: ${STATUS_OPTIONS.join(', ')}.`
      );
    } else {
      updateData.status = payload.status;
    }
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { error: errors[0], details: errors },
      { status: 400 }
    );
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: 'Tiada medan sah diberikan untuk dikemas kini.' },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.aduan.update({
      where: { id: numericId },
      data: updateData,
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = parseId(id);

  if (numericId === null) {
    return NextResponse.json(
      { error: 'ID aduan tidak sah.' },
      { status: 400 }
    );
  }

  try {
    await prisma.aduan.delete({
      where: { id: numericId },
    });
    return NextResponse.json(
      { deleted: true, id: numericId },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
