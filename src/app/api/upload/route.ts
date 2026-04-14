import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getStorage } from 'firebase-admin/storage';
import { getFirebaseAdminAuth } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

function isPlaceholder(value?: string) {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return (
    normalized.startsWith('your-') ||
    normalized.includes('example') ||
    normalized.includes('...') ||
    normalized.includes('<')
  );
}

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

function getFirebaseStorageBucket() {
  const bucket =
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (!bucket || isPlaceholder(bucket)) {
    return null;
  }

  return bucket.replace(/^gs:\/\//, '');
}

function isFirebaseStorageConfigured() {
  const bucket = getFirebaseStorageBucket();
  if (!bucket) {
    return false;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountJson && !isPlaceholder(serviceAccountJson)) {
    return true;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  return (
    !isPlaceholder(projectId) &&
    !isPlaceholder(clientEmail) &&
    !isPlaceholder(privateKey)
  );
}

function getFileExtension(fileName: string, mimeType: string) {
  const extFromName = path.extname(fileName || '').trim();
  if (extFromName) {
    return extFromName.toLowerCase();
  }

  if (mimeType === 'image/png') {
    return '.png';
  }
  if (mimeType === 'image/webp') {
    return '.webp';
  }
  return '.jpg';
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
  return new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'rentro_uploads',
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error || new Error('Cloudinary upload failed'));
          return;
        }
        resolve({ secure_url: result.secure_url });
      }
    );

    stream.end(buffer);
  });
}

async function uploadBufferToFirebaseStorage(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
) {
  const bucketName = getFirebaseStorageBucket();
  if (!bucketName) {
    throw new Error('Firebase Storage bucket not configured');
  }

  const adminApp = getFirebaseAdminAuth().app;
  const bucket = getStorage(adminApp).bucket(bucketName);
  const ext = getFileExtension(originalName, mimeType);
  const objectPath = `rentro_uploads/${Date.now()}-${randomUUID()}${ext}`;
  const file = bucket.file(objectPath);

  await file.save(buffer, {
    contentType: mimeType,
    resumable: false,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });

  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires: '2500-01-01',
  });

  return signedUrl;
}

async function uploadBufferLocally(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
) {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = getFileExtension(originalName, mimeType);
  const fileName = `${Date.now()}-${randomUUID()}${ext}`;
  const fullPath = path.join(uploadsDir, fileName);

  await fs.writeFile(fullPath, buffer);
  return `/uploads/${fileName}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (isCloudinaryConfigured()) {
      try {
        configureCloudinary();
        const res = await uploadBufferToCloudinary(buffer);
        return NextResponse.json({ url: res.secure_url, storage: 'cloudinary' }, { status: 200 });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Cloudinary upload failed';
        console.warn('Cloudinary upload failed, trying fallback:', message);
      }
    }

    if (isFirebaseStorageConfigured()) {
      try {
        const firebaseUrl = await uploadBufferToFirebaseStorage(
          buffer,
          file.name,
          file.type || 'image/jpeg',
        );
        return NextResponse.json({ url: firebaseUrl, storage: 'firebase-storage' }, { status: 200 });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Firebase storage upload failed';
        console.warn('Firebase upload failed, trying local fallback:', message);
      }
    }

    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        {
          error:
            'Upload provider is not configured. Configure Cloudinary or Firebase Storage admin credentials.',
        },
        { status: 500 },
      );
    }

    const localUrl = await uploadBufferLocally(
      buffer,
      file.name,
      file.type || 'image/jpeg',
    );

    return NextResponse.json({ url: localUrl, storage: 'local' }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Image upload failed';
    console.error('Upload error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
