"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type GalleryImage = {
  media_id: string;
  order: number;
  url: string;
  alt: string | null;
};

type RecipeGalleryProps = {
  images: GalleryImage[];
  recipeTitle: string;
  className?: string;
};

export function RecipeGallery({
  images,
  recipeTitle,
  className,
}: RecipeGalleryProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const countClass =
    images.length === 1
      ? "recipe-gallery__grid--one"
      : images.length === 2
        ? "recipe-gallery__grid--two"
        : images.length === 3
          ? "recipe-gallery__grid--three"
          : "recipe-gallery__grid--many";

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (activeIndex === null) {
      if (dialog.open) {
        dialog.close();
      }
      return;
    }

    if (!dialog.open) {
      dialog.showModal();
    }

    closeButtonRef.current?.focus();
  }, [activeIndex]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    function handleCancel(event: Event) {
      event.preventDefault();
      setActiveIndex(null);
    }

    dialog.addEventListener("cancel", handleCancel);

    return () => {
      dialog.removeEventListener("cancel", handleCancel);
    };
  }, []);

  if (images.length === 0) {
    return null;
  }

  const activeImage =
    activeIndex !== null ? images[activeIndex] ?? null : null;

  return (
    <section
      aria-labelledby={titleId}
      className={cn("recipe-gallery", className)}
    >
      <h2 id={titleId} className="recipe-gallery__title">
        גלריה
      </h2>

      <ul className={cn("recipe-gallery__grid", countClass)}>
        {images.map((image, index) => (
          <li key={image.media_id} className="recipe-gallery__item">
            <button
              type="button"
              className="recipe-gallery__trigger public-focus-ring"
              onClick={() => setActiveIndex(index)}
              aria-label={`פתיחת תמונה ${index + 1} מתוך ${images.length}`}
            >
              <Image
                src={image.url}
                alt={image.alt?.trim() || recipeTitle}
                fill
                sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
                className="recipe-gallery__image"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className="recipe-gallery__dialog"
        aria-label="תצוגת תמונה מוגדלת"
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            setActiveIndex(null);
          }
        }}
      >
        {activeImage ? (
          <div className="recipe-gallery__dialog-panel">
            <button
              ref={closeButtonRef}
              type="button"
              className="recipe-gallery__close public-focus-ring"
              onClick={() => setActiveIndex(null)}
              aria-label="סגירת תצוגת התמונה"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
            <div className="recipe-gallery__dialog-media">
              <Image
                src={activeImage.url}
                alt={activeImage.alt?.trim() || recipeTitle}
                fill
                sizes="100vw"
                className="recipe-gallery__dialog-image"
              />
            </div>
          </div>
        ) : null}
      </dialog>
    </section>
  );
}
