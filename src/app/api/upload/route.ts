import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

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

export async function POST(request: Request) {
  try {
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          error:
            'Cloudinary is not configured. Set CLOUDINARY_URL or set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.',
        },
        { status: 500 }
      );
    }

    configureCloudinary();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const res = await uploadBufferToCloudinary(buffer);

    return NextResponse.json({ url: res.secure_url }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Image upload failed';
    console.error('Upload error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
