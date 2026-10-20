# Reduz as fotos enviadas pela F7 (e as imagens do PDF institucional) para o site.
# Saída: conteudo/obras/<slug>.jpg (1400 px) e <slug>-m.jpg (720 px). Roda uma vez, na máquina do Elison.
import fitz, io, os, sys
from PIL import Image, ImageOps

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASTA = r"C:\Users\tecbl\OneDrive\Desktop\F7\REALIZAÇÕES FLORENZANO 2006 A 2024 (685 unid.)-20261020T024815Z-1-001\REALIZAÇÕES FLORENZANO 2006 A 2024 (685 unid.)"
PDF = r"C:\Users\tecbl\OneDrive\Desktop\F7\1 Incorp You Institucional (1).pdf"

def salvar(im, destino, grande=1400, mini=720):
    im = ImageOps.exif_transpose(im).convert("RGB")
    a = im.copy(); a.thumbnail((grande, grande))
    a.save(os.path.join(RAIZ, "conteudo", destino + ".jpg"), "JPEG", quality=74, optimize=True, progressive=True)
    b = im.copy(); b.thumbnail((mini, mini))
    b.save(os.path.join(RAIZ, "conteudo", destino + "-m.jpg"), "JPEG", quality=70, optimize=True, progressive=True)
    return a.size

try:
    import pillow_heif
    pillow_heif.register_heif_opener()
except Exception:
    print("sem suporte a HEIC: SAINT JAMES será pulado")

pastas = {
 "1 YOLANDA": "yolanda-name", "10 GENOVA": "genova", "11 SIENA": "siena", "12 VICENZA": "vicenza", "13 MODENA": "modena",
 "14 PALERMO": "palermo", "15 PARMA": "parma", "16 VERONA": "verona", "17 SAINT": "saint-james", "18 BERGAMO": "bergamo",
 "19 CITY": "city-village", "2 FLORENZANO 1": "florenzano-1", "20 CHRONOS": "chronos", "21 CAPRI": "capri",
 "3 FLORENZANO2": "florenzano-2", "4 FLORENZANO 3": "florenzano-3", "5 FIRENZE": "firenze", "6 VENEZA": "veneza",
 "7 MIL": "milao", "8 N": "napoli", "9 ROMA": "roma", "A- CASA": "casa-350", "B- CASA": "casa-420",
 "C- CLINICA": "clinica-750", "D- CASA": "casa-220",
}
for f in sorted(os.listdir(PASTA)):
    if not f.lower().endswith((".jpg", ".jpeg")): continue
    slug = next((v for k, v in pastas.items() if f.upper().startswith(k.upper())), None)
    if not slug: print("sem mapeamento:", f); continue
    try:
        print(slug, salvar(Image.open(os.path.join(PASTA, f)), "obras/" + slug))
    except Exception as e:
        print("PULADO", f, type(e).__name__)

# imagens do PDF (renders e fotos): página -> slug
d = fitz.open(PDF)
pdf = {(7, 1): "city-village-pdf", (10, 1): "santorini", (12, 1): "obra-nascer-do-sol", (12, 1): "obra-nascer-do-sol",
       (12, 1): "obra-nascer-do-sol", (12, 1): "obra-nascer-do-sol"}
mapa = {8: ("city-village-render", 1), 11: ("santorini", 1), 12: ("obra-nascer-do-sol", 1), 13: ("ibiza", 1),
        14: ("my-house-agua-verde", 0), 15: ("you-reboucas", 0), 16: ("my-house-campos-sales", 1), 17: ("ravello-beach-home", 1)}
for pagina, (slug, k) in mapa.items():
    imgs = [i for i in d[pagina - 1].get_images(full=True) if d.extract_image(i[0])["width"] != d.extract_image(i[0])["height"]]
    base = d.extract_image(imgs[0][0])
    print(slug, salvar(Image.open(io.BytesIO(base["image"])), "obras/" + slug))
