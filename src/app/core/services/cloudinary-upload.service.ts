import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const UPLOAD_URL = 'https://api.cloudinary.com/v1_1';

const env = environment as { cloudinary?: { cloudName?: string; uploadPreset?: string } };

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id?: string;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class CloudinaryUploadService {
  private readonly cloudName = env.cloudinary?.cloudName;
  private readonly uploadPreset = env.cloudinary?.uploadPreset;

  /**
   * Envoie un fichier vers Cloudinary et retourne l'URL sécurisée.
   * Détecte automatiquement le type de ressource (image, video, raw pour PDF).
   */
  upload(file: File, folder?: string): Observable<CloudinaryUploadResponse> {
    let resourceType: 'image' | 'video' | 'raw' = 'image';

    if (file.type === 'application/pdf') {
      resourceType = 'raw';
    } else if (file.type.startsWith('video/')) {
      resourceType = 'video';
    } else if (file.type.startsWith('image/')) {
      resourceType = 'image';
    } else {
      resourceType = 'raw';
    }

    return this.uploadResource(file, resourceType, folder);
  }

  /**
   * Envoie une vidéo vers Cloudinary et retourne l'URL sécurisée.
   */
  uploadVideo(file: File, folder?: string): Observable<CloudinaryUploadResponse> {
    return this.uploadResource(file, 'video', folder);
  }

  private uploadResource(
    file: File,
    resourceType: 'image' | 'video' | 'raw',
    folder?: string
  ): Observable<CloudinaryUploadResponse> {
    return new Observable((observer) => {
      if (!this.cloudName || !this.uploadPreset) {
        observer.error(new Error('Cloudinary non configuré (cloudName, uploadPreset)'));
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      if (folder) formData.append('folder', folder);

      const url = `${UPLOAD_URL}/${this.cloudName}/${resourceType}/upload`;

      fetch(url, {
        method: 'POST',
        body: formData,
      })
        .then(async (res) => {
          const data = (await res.json()) as CloudinaryUploadResponse & { error?: { message?: string } };
          if (data.error) {
            let msg = data.error.message ?? 'Erreur Cloudinary';
            if (msg.toLowerCase().includes('upload preset')) {
              msg += ' — Créez le preset "' + this.uploadPreset + '" dans Cloudinary : Settings > Upload > Add upload preset (mode Unsigned)';
            }
            observer.error(new Error(msg));
            return;
          }
          if (data.secure_url) {
            observer.next({
              ...data,
              secure_url: CloudinaryUploadService.normalizeDeliveryUrl(data.secure_url),
            });
            observer.complete();
          } else {
            observer.error(new Error('Réponse Cloudinary invalide'));
          }
        })
        .catch((err) => {
          const msg = err?.message ?? (err?.toString?.() || 'Erreur réseau ou CORS');
          observer.error(new Error(msg));
        });
    });
  }

  /**
   * Nettoie une URL Cloudinary existante pour supprimer les transformations invalides
   * ajoutées sur les PDFs `raw/upload`.
   */
  static normalizeDeliveryUrl(url: string): string {
    if (!url || !url.includes('cloudinary.com')) {
      return url;
    }

    return url.replace('/fl_attachment:false/', '/');
  }
}
