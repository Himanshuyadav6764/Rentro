# StudentRental

Next.js + Tailwind CSS + MongoDB starter for StudentRental authentication.

Implemented in this phase:

- Phone number + OTP login
- Google login (Google Identity Services)
- JWT-based session cookie auth
- User profile persisted in MongoDB
- UI styled to match provided StudentRental login design

## 1) Setup

```bash
npm install
cp .env.example .env.local
```

Update `.env.local` values:

- `MONGODB_URI`: MongoDB connection URI
- `MONGODB_DB`: database name (`studentrental`)
- `JWT_SECRET`: strong secret string
- `GOOGLE_CLIENT_ID`: Google OAuth Web Client ID
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: same Google client ID for frontend button
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `GROQ_API_KEY`: Groq API key for title-based auto description generation
- `NEXT_PUBLIC_IMAGE_AI_MODEL_URL` (optional): URL/path to custom trained TensorFlow.js `model.json`
- `NEXT_PUBLIC_IMAGE_AI_LABELS` (optional): comma-separated class labels in exact model output order

## 2) Run

```bash
npm run dev
```

Open http://localhost:3000

## Auth APIs

## Image Upload API

## AI Description API

- `POST /api/ai/description`
  - body: `{ "title": "Calculator" }`
  - generates short rental description from title
  - max output length: 20 words

- `POST /api/upload`
  - body: multipart form-data with `file`
  - uploads image to Cloudinary folder `rentro_uploads`
  - accepts image files up to 8MB
  - returns `{ "url": "https://...", "publicId": "rentro_uploads/..." }`

- `POST /api/auth/send-otp`
  - body: `{ "phone": "+919876543210" }`
  - sends OTP and stores hashed OTP in MongoDB
  - in development, returns `devOtp` for local testing

- `POST /api/auth/verify-otp`
  - body: `{ "phone": "+919876543210", "otp": "123456" }`
  - verifies OTP, creates/updates user, sets JWT cookie

- `POST /api/auth/google`
  - body: `{ "credential": "<google-id-token>" }`
  - verifies Google token, creates/updates user, sets JWT cookie

- `GET /api/auth/me`
  - returns currently authenticated user from JWT cookie

- `POST /api/auth/logout`
  - clears auth cookie

## Notes

- OTP SMS gateway is not integrated yet; current OTP is generated/stored securely and echoed as `devOtp` only in development mode.
- `trustScore` and `riskScore` fields are stored in user profile for future AI trust/risk/pricing modules.

## Image Intelligence AI

- Upload image in Create Listing Step 1.
- AI auto-fills title and category.
- Default model: MobileNet (`@tensorflow-models/mobilenet`).
- If custom trained model is configured, app uses custom model first and falls back to MobileNet.

### Train and connect custom model (quick)

1. Train an image classifier in Teachable Machine (or any TFJS-compatible pipeline).
2. Export as TensorFlow.js (model.json + shard files).
3. Put exported files in `public/models/item-ai/`.
4. Add to `.env.local`:

```dotenv
NEXT_PUBLIC_IMAGE_AI_MODEL_URL=/models/item-ai/model.json
NEXT_PUBLIC_IMAGE_AI_LABELS=books,laptop,calculator,chair,cycle,others
```

5. Restart dev server.

The label order in `NEXT_PUBLIC_IMAGE_AI_LABELS` must match your model output index order exactly.
