# Enable video assets

For 100 MB videos, your Supabase plan must support files above 50 MB. The Free plan has a 50 MB maximum. On a supported paid plan, set **Storage Settings → Global file size limit** to at least **100 MB**, then run `supabase/migrations/20260930_video_100mb.sql` in **SQL Editor**. This enables MP4/WebM and sets the media bucket limit to 100 MB, without changing administrator policies or other buckets. Code changes cannot override your plan's storage limit. See https://supabase.com/docs/guides/storage/uploads/file-limits.

In **Media Library → Add Media Asset**, select **Video → Upload video from computer**, choose an MP4 or WebM file (up to 100 MB), and save its title. The URL field is optional; uploaded files fill it automatically. Uploaded files are registered in the library as soon as the upload completes. The Video filter shows your video assets and playback controls. Images retain the application's 25 MB limit.

To replace a website video, open **Page Builder**, select the relevant video's controls, then **Choose video from library**. Each homepage video card has its own picker. Click **Save & Publish** to publish the changed video URL. Changing the library title alone does not replace an existing page's video.

The URL field still supports external MP4/WebM and YouTube/Vimeo links. Uploads go directly to Supabase; there is no automatic video compression. Use a browser-compatible MP4 or WebM export. Images continue to use the separate image picker.
