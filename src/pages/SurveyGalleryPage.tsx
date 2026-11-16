import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Lenis from 'lenis';
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Camera,
  Film,
  Layers,
  Maximize2,
  X,
} from 'lucide-react';
import { REFERENCE_IMAGES, REFERENCE_VIDEO } from '../data/presets';

type GalleryCategory = 'tutte' | 'progetto' | 'attuale' | 'negozio';

const CATEGORY_FILTERS: { id: GalleryCategory; label: string }[] = [
  { id: 'tutte', label: 'Tutte' },
  { id: 'progetto', label: 'Progetto e piantina' },
  { id: 'attuale', label: 'Camera attuale' },
  { id: 'negozio', label: 'Showroom Mondo Convenienza' },
];

export const SurveyGalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory>('tutte');
  const [lightboxImageId, setLightboxImageId] = useState<string | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const filteredImages = useMemo(() => {
    if (selectedCategory === 'tutte') return REFERENCE_IMAGES;
    return REFERENCE_IMAGES.filter((img) => img.category === selectedCategory);
  }, [selectedCategory]);

  const activeLightboxImage = useMemo(() => {
    if (!lightboxImageId) return null;
    return REFERENCE_IMAGES.find((img) => img.id === lightboxImageId) ?? null;
  }, [lightboxImageId]);

  const navigateLightbox = (dir: -1 | 1) => {
    if (!activeLightboxImage) return;
    const idx = filteredImages.findIndex((i) => i.id === activeLightboxImage.id);
    if (idx === -1) return;
    const nextIdx = (idx + dir + filteredImages.length) % filteredImages.length;
    setLightboxImageId(filteredImages[nextIdx].id);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-8 px-8 font-normal">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Intestazione */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-800 pb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="h-8 px-4 rounded-md border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-300 inline-flex items-center gap-2">
                <Camera className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                <span>Documentazione fotografica e rilievo metrico</span>
              </span>
              <span className="h-8 px-4 rounded-md border border-zinc-800 bg-zinc-900 text-xs font-normal text-zinc-400 inline-flex items-center">
                <span>{REFERENCE_IMAGES.length} foto + 1 video panoramico</span>
              </span>
            </div>
            <h1 className="text-3xl font-medium text-zinc-100">
              Archivio rilievo, piantina 1:50 e schede showroom
            </h1>
            <p className="text-sm font-normal text-zinc-400 max-w-3xl">
              Tutte le fonti visive utilizzate per ricostruire fedelmente la geometria della camera
              (468 × 424 cm, altezza 285 cm), i mobili attuali e i nuovi moduli Mondo Convenienza.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/studio')}
            className="h-10 px-6 rounded-md bg-zinc-100 text-zinc-950 text-xs font-medium inline-flex items-center gap-2 hover:bg-zinc-200 transition-colors shrink-0"
          >
            <Box className="h-4 w-4" strokeWidth={1.5} />
            <span>Torna allo studio 3D e 2D</span>
          </button>
        </div>

        {/* Sezione Video Panoramico e Piantina Principale */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 p-6 rounded-md border border-zinc-800 bg-zinc-900 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                <h2 className="text-base font-medium text-zinc-100">
                  {REFERENCE_VIDEO.title}
                </h2>
              </div>
              <span className="h-8 px-4 rounded-md border border-zinc-800 bg-zinc-950 text-xs font-normal text-zinc-400 inline-flex items-center">
                Rilievo video
              </span>
            </div>

            <div className="w-full rounded-md border border-zinc-800 bg-zinc-950 overflow-hidden">
              <video
                src={REFERENCE_VIDEO.src}
                controls
                preload="metadata"
                className="w-full max-h-[420px] object-contain bg-zinc-950"
              />
            </div>

            <p className="text-xs font-normal text-zinc-400 leading-relaxed">
              {REFERENCE_VIDEO.description}
            </p>
          </div>

          <div className="lg:col-span-5 p-6 rounded-md border border-zinc-800 bg-zinc-900 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                <h2 className="text-base font-medium text-zinc-100">
                  Piantina quotata camera nuova (scala 1:50)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setLightboxImageId('piantina')}
                className="h-8 px-4 rounded-md border border-zinc-800 bg-zinc-950 text-xs font-medium text-zinc-100 inline-flex items-center gap-2 hover:bg-zinc-800 transition-colors"
              >
                <Maximize2 className="h-4 w-4" strokeWidth={1.5} />
                <span>Ingrandisci</span>
              </button>
            </div>

            <div
              onClick={() => setLightboxImageId('piantina')}
              className="cursor-pointer w-full h-[360px] rounded-md border border-zinc-800 bg-zinc-950 overflow-hidden flex items-center justify-center"
            >
              <img
                src="/reference/piantina/piantina-camera-nuova.jpg"
                alt="Piantina camera nuova"
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>

            <p className="text-xs font-normal text-zinc-400 leading-relaxed">
              Disegno tecnico originale con le quote perimetrali (468 × 424 cm, spalla nord-ovest
              242 × 215 cm) e il posizionamento della libreria ad angolo, scrivania, letto 1.5
              piazze e armadi laterali.
            </p>
          </div>
        </div>

        {/* Barra Filtri Categorie */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORY_FILTERS.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`h-10 px-4 rounded-md text-xs font-medium border transition-colors ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-100 hover:bg-zinc-800'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <span className="text-xs font-normal text-zinc-400">
            Visualizzate {filteredImages.length} immagini · Clicca su una scheda per l’ispezione a
            schermo intero
          </span>
        </div>

        {/* Griglia Fotografica */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              onClick={() => setLightboxImageId(img.id)}
              className="cursor-pointer group rounded-md border border-zinc-800 bg-zinc-900 overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-colors"
            >
              <div className="relative h-64 w-full bg-zinc-950 border-b border-zinc-800 overflow-hidden">
                <img
                  src={img.src}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 h-8 w-8 rounded-md border border-zinc-800 bg-zinc-950/90 text-zinc-200 flex items-center justify-center">
                  <Maximize2 className="h-4 w-4" strokeWidth={1.5} />
                </div>
              </div>

              <div className="p-6 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-normal text-zinc-400">
                    {img.category === 'progetto'
                      ? 'Progetto e piantina'
                      : img.category === 'attuale'
                      ? 'Camera attuale'
                      : 'Showroom Mondo Convenienza'}
                  </span>
                </div>
                <h3 className="text-base font-medium text-zinc-100">{img.title}</h3>
                <p className="text-xs font-normal text-zinc-400 leading-relaxed">
                  {img.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modale */}
      {activeLightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-zinc-950/95 flex items-center justify-center p-8"
          onClick={() => setLightboxImageId(null)}
        >
          <div
            className="max-w-5xl w-full rounded-md border border-zinc-800 bg-zinc-900 p-6 flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-medium text-zinc-100">
                  {activeLightboxImage.title}
                </h3>
                <p className="text-xs font-normal text-zinc-400">
                  {activeLightboxImage.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigateLightbox(-1)}
                  className="h-10 w-10 rounded-md border border-zinc-800 bg-zinc-950 text-zinc-200 inline-flex items-center justify-center hover:bg-zinc-800"
                  title="Immagine precedente"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() => navigateLightbox(1)}
                  className="h-10 w-10 rounded-md border border-zinc-800 bg-zinc-950 text-zinc-200 inline-flex items-center justify-center hover:bg-zinc-800"
                  title="Immagine successiva"
                >
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxImageId(null)}
                  className="h-10 w-10 rounded-md border border-zinc-800 bg-zinc-950 text-zinc-200 inline-flex items-center justify-center hover:bg-zinc-800"
                  title="Chiudi"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="w-full max-h-[72vh] rounded-md border border-zinc-800 bg-zinc-950 overflow-hidden flex items-center justify-center p-4">
              <img
                src={activeLightboxImage.src}
                alt={activeLightboxImage.title}
                className="max-h-[68vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyGalleryPage;
