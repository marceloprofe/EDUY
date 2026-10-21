// Estos identificadores son públicos. No agregues aquí el API Secret.
const CLOUDINARY_CLOUD_NAME = "drlfhikq";
const CLOUDINARY_UPLOAD_PRESET = "eduy_videos_unsigned";

function cloudinaryConfigurado() {
    return Boolean(
        CLOUDINARY_CLOUD_NAME &&
        CLOUDINARY_UPLOAD_PRESET
    );
}

export {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_PRESET,
    cloudinaryConfigurado
};
