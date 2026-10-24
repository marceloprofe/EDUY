// Estos identificadores son públicos. No agregues aquí el API Secret.
const CLOUDINARY_CLOUD_NAME = "drlfhikq";
const CLOUDINARY_UPLOAD_PRESET = "eduy_videos_unsigned";
// El preset actual admite cargas sin firma y se reutiliza para las portadas.
// Si Cloudinary separa los presets más adelante, solo hay que cambiar esta constante.
const CLOUDINARY_IMAGE_UPLOAD_PRESET = CLOUDINARY_UPLOAD_PRESET;

function cloudinaryConfigurado() {
    return Boolean(
        CLOUDINARY_CLOUD_NAME &&
        CLOUDINARY_UPLOAD_PRESET
    );
}

function cloudinaryImagenConfigurado() {
    return Boolean(
        CLOUDINARY_CLOUD_NAME &&
        CLOUDINARY_IMAGE_UPLOAD_PRESET
    );
}

export {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_IMAGE_UPLOAD_PRESET,
    CLOUDINARY_UPLOAD_PRESET,
    cloudinaryConfigurado,
    cloudinaryImagenConfigurado
};
