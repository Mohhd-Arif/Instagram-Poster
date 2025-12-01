📸 Instagram Media Uploader
OUTPUT IS HERE --> [Instagram Page – Daily Affirmations to Heal](https://www.instagram.com/daily_affirmations_to_heal/)

A Node.js-based tool that allows you to upload images and videos to Cloudinary, create Instagram media containers, check upload status, and publish posts automatically using the Instagram Graph API.

🚀 Features

✔ Upload photos and videos to Cloudinary
✔ Automatically generate public URLs for uploaded media
✔ Create Instagram media containers (image/video)
✔ Poll media upload processing status (IN_PROGRESS → FINISHED)
✔ Publish posts to your Instagram Business/Creator account
✔ Add captions, hashtags, and metadata
✔ Supports video uploads up to 60 seconds
✔ Errors are logged with detailed messages for debugging

🛠️ Tech Stack

Node.js

Express.js

Instagram Graph API

Cloudinary

Axios

FFmpeg (optional — if adding text to videos)

📦 Installation

Clone the repository:

git clone https://github.com/yourname/instagram-uploader.git
cd instagram-uploader
npm install


Rename .env.example → .env and update:

INSTAGRAM_USER_ID=your_ig_user_id
PAGE_ACCESS_TOKEN=your_long_lived_token
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx

▶️ Usage
1. Upload a media file (image/video)
const url = await uploadToCloudinary("./media/video.mp4");

2. Create IG media container
const containerId = await createMediaContainer(url, "My caption here");

3. Poll the upload status
const status = await checkMediaStatus(containerId);

4. Publish the post
await publishMedia(containerId);

📤 Upload Flow (Important)

The complete upload flow looks like this:

Upload file → Cloudinary

Cloudinary gives a secure_url

Create IG media container

If type = video, Instagram begins processing

Poll every 5–10 seconds until status_code = FINISHED

Publish the media

Instagram returns a post ID

📄 Example Response
Media Upload Status (Video)
{
  "status_code": "FINISHED",
  "status": "Finished: Media has been uploaded and it is ready to be published.",
  "id": "17851337280597251"
}

⚠️ Permissions Required

Your Instagram app must be in Live Mode and have:

instagram_basic

instagram_content_publish

pages_show_list

pages_read_engagement

You must also:

✔ Connect an Instagram Business/Creator account
✔ Connect to a Facebook Page
✔ Generate a long-lived access token
✔ Add the required permissions

🧪 Testing

You can test upload using:

node test.js


Sample output:

Uploading to Cloudinary...
Creating IG container...
Status: IN_PROGRESS
Status: FINISHED
Publishing...
Post ID: 182738172837

🐞 Troubleshooting
Unknown OAuthException Error

Ensure your app is in Live Mode

Ensure required permissions are approved and added during login

Re-generate an Instagram long-lived access token

"Video not Ready for Publishing"

Poll until you receive:

status_code: FINISHED


Then publish.

🤝 Contributing

Pull requests are welcome. Open an issue to discuss improvements or bugs.

📜 License

MIT License © 2025 Instagram Poster

If you want, I can also:

✅ Add screenshots
✅ Add a flow diagram
✅ Add environment setup steps
✅ Add real API examples
Just tell me!
