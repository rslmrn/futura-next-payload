"use server";

import { getPlaiceholder } from "plaiceholder";

// Placeholder usado cuando la imagen no existe o no se puede procesar (p. ej.
// archivos aun no re-subidos al Storage). Evita que una imagen faltante tumbe
// toda la pagina; coincide con `base64Placeholder` de utils.ts.
const fallbackBase64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/ANra4Pz8/ODf4M3O1ADj4+Ruc3YyLi1oYWEAW1pbAQUFAgECY2FjAI+Ok3JwdLGvtNjX3v2XGj2mfgmhAAAAAElFTkSuQmCC";

// getBase64 corre en el servidor y `fetch` de Node exige una URL absoluta, asi
// que resolvemos la base del propio deployment: VERCEL_URL en Vercel/preview,
// localhost en desarrollo. Asi el front puede usar paths relativos sin depender
// de NEXT_PUBLIC_BASE_URL por entorno.
function toAbsoluteUrl(image: string) {
  if (/^https?:\/\//i.test(image)) return image;
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : `http://localhost:${process.env.PORT ?? 3000}`;
  return `${base}${image.startsWith("/") ? "" : "/"}${image}`;
}

export default async function getBase64(image: string) {
  try {
    const res = await fetch(toAbsoluteUrl(image));
    if (!res.ok) {
      return fallbackBase64;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const { base64 } = await getPlaiceholder(buffer);
    return base64;
  } catch (err) {
    // Imagen inaccesible o no procesable: degradamos al placeholder en vez de
    // lanzar y romper el render del servidor.
    return fallbackBase64;
  }
}
