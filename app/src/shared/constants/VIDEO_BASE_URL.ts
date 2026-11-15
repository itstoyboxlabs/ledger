// Where the tutorial videos and posters are served from: a public Supabase Storage bucket (`ledger-public`), so a deploy never has to
// carry the large files. `npm run videos` uploads them from demo/video.
export const VIDEO_BASE_URL = 'https://newimvknbatgjauygmwu.supabase.co/storage/v1/object/public/ledger-public/videos'
