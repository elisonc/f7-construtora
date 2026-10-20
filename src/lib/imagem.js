// Reduz fotos grandes no navegador antes do envio (celulares geram 5–10 MB por foto).
// Lado maior até 2000 px, JPEG 85%. Se algo falhar, envia o arquivo original.
export async function reduzirImagem(arquivo, ladoMaximo = 2000) {
  if (!arquivo.type.startsWith("image/") || arquivo.size < 600 * 1024) return arquivo;
  try {
    const bitmap = await createImageBitmap(arquivo);
    const escala = Math.min(1, ladoMaximo / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob || blob.size >= arquivo.size) return arquivo;
    return new File([blob], arquivo.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return arquivo;
  }
}
