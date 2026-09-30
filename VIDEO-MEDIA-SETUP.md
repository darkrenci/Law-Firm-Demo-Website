# Enable video assets

Run `supabase/migrations/20260930_video_media.sql` once in **Supabase → SQL Editor**. It adds MP4 and WebM to the existing media bucket's allowed formats without changing administrator policies or other buckets. No new credentials are needed.

In **Media Library → Add Media Asset**, select **Video**, upload an MP4 or WebM file (up to 25 MB), and save its title. Uploaded files are registered in the library as soon as the upload completes. The Video filter shows your video assets and playback controls.

To replace a website video, open **Page Builder**, select the relevant video's controls, then **Choose video from library**. Each homepage video card has its own picker. Click **Save & Publish** to publish the changed video URL. Changing the library title alone does not replace an existing page's video.

The URL field still supports external MP4/WebM and YouTube/Vimeo links. Uploads go directly to Supabase; there is no automatic video compression. Use a browser-compatible MP4 or WebM export. Images continue to use the separate image picker.
