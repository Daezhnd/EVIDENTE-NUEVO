export const generateVideoThumbnail = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.playsInline = true;
        video.muted = true;

        const url = URL.createObjectURL(file);
        video.src = url;

        video.onloadedmetadata = () => {
            // Intentar capturar al 10% de la duración o 1s, lo que sea menor
            // Si es muy corto, usar 0.
            let currentTime = Math.min(1, video.duration * 0.1);
            if (video.duration < 1) currentTime = 0;

            video.currentTime = currentTime;
        };

        video.onseeked = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('No se pudo crear el contexto del canvas'));
                    return;
                }

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('No se pudo generar el blob de la imagen'));
                    }

                    // Limpieza
                    URL.revokeObjectURL(url);
                    video.remove();
                }, 'image/jpeg', 0.85);
            } catch (error) {
                reject(error);
            }
        };

        video.onerror = () => {
            reject(new Error('Error al cargar el video'));
            URL.revokeObjectURL(url);
        };
    });
};
