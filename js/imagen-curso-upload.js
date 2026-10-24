import {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_IMAGE_UPLOAD_PRESET,
    cloudinaryImagenConfigurado
} from "./cloudinary-config.js";

const TIPOS_IMAGEN_PERMITIDOS = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

const TAMANO_MAXIMO_IMAGEN = 5 * 1024 * 1024;

function validarArchivoImagen(archivo) {
    return Boolean(
        archivo
        && TIPOS_IMAGEN_PERMITIDOS.includes(archivo.type)
        && archivo.size > 0
        && archivo.size <= TAMANO_MAXIMO_IMAGEN
    );
}

function subirImagenCurso(archivo, alProgresar = () => {}) {
    if (!cloudinaryImagenConfigurado()) {
        throw new Error("cloudinary-no-configurado");
    }

    if (!validarArchivoImagen(archivo)) {
        throw new Error("imagen-no-valida");
    }

    const datos = new FormData();
    datos.append("file", archivo);
    datos.append("upload_preset", CLOUDINARY_IMAGE_UPLOAD_PRESET);

    const endpoint =
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    return new Promise((resolve, reject) => {
        const solicitud = new XMLHttpRequest();

        solicitud.upload.addEventListener("progress", (evento) => {
            if (evento.lengthComputable) {
                alProgresar(Math.round(evento.loaded / evento.total * 100));
            }
        });

        solicitud.addEventListener("load", () => {
            let respuesta = null;

            try {
                respuesta = JSON.parse(solicitud.responseText);
            } catch {
                // Una respuesta que no sea JSON se procesa como error de subida.
            }

            if (
                solicitud.status >= 200
                && solicitud.status < 300
                && respuesta?.secure_url
            ) {
                resolve(respuesta.secure_url);
                return;
            }

            reject(new Error(
                respuesta?.error?.message || "cloudinary-error-subida"
            ));
        });

        solicitud.addEventListener("error", () => {
            reject(new Error("cloudinary-error-red"));
        });

        solicitud.open("POST", endpoint);
        solicitud.send(datos);
    });
}

export {
    TAMANO_MAXIMO_IMAGEN,
    TIPOS_IMAGEN_PERMITIDOS,
    subirImagenCurso,
    validarArchivoImagen
};
