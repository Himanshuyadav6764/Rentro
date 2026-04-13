import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

function isCloudinaryConfigured() {
  if (process.env.CLOUDINARY_URL) {
    return true;
  }

  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function configureCloudinary() {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
      secure: true,
      cloudinary_url: process.env.CLOUDINARY_URL,
    });
    return;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

async function uploadBufferToCloudinary(buffer: Buffer) {
  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'rentro_uploads',
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result?.secure_url || !result.public_id) {
          reject(error || new Error('Cloudinary upload failed'));
          return;
        }
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );

    stream.end(buffer);
  });
}

async function uploadBufferLocally(buffer: Buffer, mimeType: string) {
  const extension = MIME_EXTENSION_MAP[mimeType] || 'jpg';
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
  const relativeDir = path.join('uploads', 'rentro_uploads');
  const absoluteDir = path.join(process.cwd(), 'public', relativeDir);
  const absoluteFilePath = path.join(absoluteDir, fileName);

  await mkdir(absoluteDir, { recursive: true });
  await writeFile(absoluteFilePath, buffer);

  const relativeUrl = `/${relativeDir.replaceAll('\\', '/')}/${fileName}`;
  return {
    url: relativeUrl,
    publicId: `local:${fileName}`,
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'Image size must be 8MB or smaller' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!isCloudinaryConfigured()) {
      const fallback = await uploadBufferLocally(buffer, file.type);
      return NextResponse.json(fallback, { status: 200 });
    }

    configureCloudinary();

    try {
      const res = await uploadBufferToCloudinary(buffer);

      return NextResponse.json(
        { url: res.secure_url, publicId: res.public_id },
        { status: 200 }
      );
    } catch {
      const fallback = await uploadBufferLocally(buffer, file.type);
      return NextResponse.json(fallback, { status: 200 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Image upload failed';
    console.error('Upload error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
