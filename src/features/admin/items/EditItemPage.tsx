import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAdminItem,
  updateAdminItem,
  deleteAdminItem,
} from "../api/adminItemApi";
import "./createItem.css";

type Offset = { x: number; y: number };
type ImgSize = { w: number; h: number };

export default function EditItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */

  const [name, setName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productSpecification, setProductSpecification] = useState("");
  const [details, setDetails] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [pricePerDay, setPricePerDay] = useState(0);
  const [color, setColor] = useState("#96b97e");
  const [isActive, setIsActive] = useState(true);

  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");

  const [zoom1, setZoom1] = useState(1);
  const [zoom2, setZoom2] = useState(1);

  const [offset1, setOffset1] = useState<Offset>({ x: 0, y: 0 });
  const [offset2, setOffset2] = useState<Offset>({ x: 0, y: 0 });

  const [imgSize1, setImgSize1] = useState<ImgSize>({ w: 1, h: 1 });
  const [imgSize2, setImgSize2] = useState<ImgSize>({ w: 1, h: 1 });

  const [dragging, setDragging] = useState<null | "img1" | "img2">(null);
  const dragStart = useRef({ x: 0, y: 0 });

  const listFrame = useRef<HTMLDivElement>(null);
  const productFrame = useRef<HTMLDivElement>(null);

  /* ---------------- HELPERS ---------------- */

  function getYoutubeId(url: string): string | null {
    try {
      const parsed = new URL(url);

      if (parsed.hostname.includes("youtube.com")) {
        return parsed.searchParams.get("v");
      }

      if (parsed.hostname.includes("youtu.be")) {
        return parsed.pathname.slice(1);
      }

      return null;
    } catch {
      return null;
    }
  }

  function clampOffset(
    offset: Offset,
    zoom: number,
    imgSize: ImgSize,
    frame: HTMLDivElement,
  ): Offset {
    const frameW = frame.clientWidth;
    const frameH = frame.clientHeight;

    const scaledW = imgSize.w * zoom;
    const scaledH = imgSize.h * zoom;

    let x: number;
    let y: number;

    // If image smaller than frame → center it
    if (scaledW <= frameW) {
      x = (frameW - scaledW) / 2;
    } else {
      x = Math.min(0, Math.max(frameW - scaledW, offset.x));
    }

    if (scaledH <= frameH) {
      y = (frameH - scaledH) / 2;
    } else {
      y = Math.min(0, Math.max(frameH - scaledH, offset.y));
    }

    return { x, y };
  }

  /* ---------------- LOAD ITEM ---------------- */

  useEffect(() => {
    async function loadItem() {
      if (!id) return;

      const item = await getAdminItem(id);

      setName(item.name);
      setProductDescription(item.productDescription || "");
      setProductSpecification(item.productSpecification || "");
      setDetails(item.details);
      setPricePerDay(item.pricePerDay);
      setColor(item.color);
      setIsActive(item.isActive);

      if (item.youtubeVideoId) {
        setYoutubeUrl(`https://www.youtube.com/watch?v=${item.youtubeVideoId}`);
      }

      setExistingImages(item.imageData || []);
    }

    loadItem();
  }, [id]);

  /* ---------------- IMAGE LOAD ---------------- */

  async function handleImage(
    file: File | undefined,
    setImage: React.Dispatch<React.SetStateAction<string>>,
    setZoom: React.Dispatch<React.SetStateAction<number>>,
    setOffset: React.Dispatch<React.SetStateAction<Offset>>,
    setImgSize: React.Dispatch<React.SetStateAction<ImgSize>>,
    frame: HTMLDivElement | null,
  ) {
    if (!file || !frame) return;

    const reader = new FileReader();

    reader.onload = async () => {
      const imgSrc = reader.result as string;

      const img = new Image();
      img.src = imgSrc;
      await img.decode();

      setImage(imgSrc);
      setImgSize({ w: img.width, h: img.height });

      const frameW = frame.clientWidth;
      const frameH = frame.clientHeight;

      const zoom = Math.max(frameW / img.width, frameH / img.height);

      const offset = {
        x: (frameW - img.width * zoom) / 2,
        y: (frameH - img.height * zoom) / 2,
      };

      setZoom(zoom);
      setOffset(offset);
    };

    reader.readAsDataURL(file);
  }

  /* ---------------- DRAG ---------------- */

  function startDrag(e: React.MouseEvent, type: "img1" | "img2") {
    setDragging(type);
    dragStart.current = { x: e.clientX, y: e.clientY };
  }

  function onDrag(e: React.MouseEvent) {
    if (!dragging) return;

    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    dragStart.current = { x: e.clientX, y: e.clientY };

    if (dragging === "img1" && listFrame.current) {
      setOffset1((o) =>
        clampOffset(
          { x: o.x + dx, y: o.y + dy },
          zoom1,
          imgSize1,
          listFrame.current!,
        ),
      );
    }

    if (dragging === "img2" && productFrame.current) {
      setOffset2((o) =>
        clampOffset(
          { x: o.x + dx, y: o.y + dy },
          zoom2,
          imgSize2,
          productFrame.current!,
        ),
      );
    }
  }

  function stopDrag() {
    setDragging(null);
  }

  /* ---------------- CROP ---------------- */

  async function cropImage(
    imgSrc: string,
    zoom: number,
    offset: Offset,
    frame: HTMLDivElement | null,
  ) {
    if (!frame) return "";

    const img = new Image();
    img.src = imgSrc;
    await img.decode();

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    canvas.width = frame.clientWidth;
    canvas.height = frame.clientHeight;

    ctx.drawImage(img, offset.x, offset.y, img.width * zoom, img.height * zoom);

    return canvas.toDataURL("image/jpeg", 0.9).split(",")[1];
  }

  /* ---------------- SAVE ---------------- */

  async function save() {
    if (!id) return;

    const images = [...existingImages];

    if (image1) {
      const cropped1 = await cropImage(
        image1,
        zoom1,
        offset1,
        listFrame.current,
      );
      images[0] = cropped1;
    }

    if (image2) {
      const cropped2 = await cropImage(
        image2,
        zoom2,
        offset2,
        productFrame.current,
      );
      images[1] = cropped2;
    }

    await updateAdminItem(id, {
      name,
      productDescription,
      productSpecification,
      details,
      pricePerDay,
      color,
      imageData: images,
      imageAspect: 1,
      youtubeVideoId: getYoutubeId(youtubeUrl) || undefined,
      isActive,
    });

    navigate("/admin");
  }

  async function deleteItem() {
    if (!id) return;

    if (!window.confirm("Är du säker på att du vill radera produkten?")) return;

    await deleteAdminItem(id);
    navigate("/admin");
  }

  function cancel() {
    navigate("/admin");
  }

  /* ---------------- PREVIEW SOURCES ---------------- */

  const preview1 =
    image1 ||
    (existingImages?.[0] ? `data:image/*;base64,${existingImages[0]}` : "");

  const preview2 =
    image2 ||
    (existingImages?.[1] ? `data:image/*;base64,${existingImages[1]}` : "");

  /* ---------------- RENDER IMAGE ---------------- */

  function renderImage(
    img: string,
    zoom: number,
    offset: Offset,
    type: "img1" | "img2",
    isExisting: boolean,
  ) {
    return (
      <img
        src={img}
        draggable={false}
        onMouseDown={!isExisting ? (e) => startDrag(e, type) : undefined}
        style={
          isExisting
            ? { width: "100%", height: "100%", objectFit: "cover" }
            : {
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                cursor: "grab",
              }
        }
      />
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="create-item-layout">
      <div className="create-item-form-panel">
        <h2>Redigera produkt</h2>

        <div className="form-section">
          <label>Namn</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />

          <label>Beskrivning</label>
          <textarea
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
          />

          <label>Specifikation</label>
          <textarea
            value={productSpecification}
            onChange={(e) => setProductSpecification(e.target.value)}
          />

          <label>Bokningsinformation</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />

          <label>YouTube video</label>
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
          />
        </div>

        <div className="form-section">
          <label>Pris per dag</label>
          <input
            type="number"
            value={pricePerDay}
            onChange={(e) => setPricePerDay(Number(e.target.value))}
          />

          <label>Färg</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>

        {/* IMAGE INPUTS */}

        <div className="form-section">
          <label>Ny listbild</label>
          <input
            type="file"
            onChange={(e) =>
              handleImage(
                e.target.files?.[0],
                setImage1,
                setZoom1,
                setOffset1,
                setImgSize1,
                listFrame.current,
              )
            }
          />

          {image1 && (
            <>
              <label>Zoom</label>
              <input
                type="range"
                min="0.2"
                max="3"
                step="0.05"
                value={zoom1}
                onChange={(e) => {
                  const z = Number(e.target.value);
                  setZoom1(z);
                  if (listFrame.current) {
                    setOffset1((o) =>
                      clampOffset(o, z, imgSize1, listFrame.current!),
                    );
                  }
                }}
              />
            </>
          )}
        </div>

        <div className="form-section">
          <label>Ny produktbild</label>
          <input
            type="file"
            onChange={(e) =>
              handleImage(
                e.target.files?.[0],
                setImage2,
                setZoom2,
                setOffset2,
                setImgSize2,
                productFrame.current,
              )
            }
          />

          {image2 && (
            <>
              <label>Zoom</label>
              <input
                type="range"
                min="0.2"
                max="3"
                step="0.05"
                value={zoom2}
                onChange={(e) => {
                  const z = Number(e.target.value);
                  setZoom2(z);
                  if (productFrame.current) {
                    setOffset2((o) =>
                      clampOffset(o, z, imgSize2, productFrame.current!),
                    );
                  }
                }}
              />
            </>
          )}
        </div>

        <div className="form-buttons">
          <button className="btn-primary" onClick={save}>
            Spara ändringar
          </button>

          <button className="btn-cancel" onClick={cancel}>
            Avbryt
          </button>

          <button className="btn-cancel" onClick={deleteItem}>
            Radera
          </button>

          <label className="active-toggle">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Aktiv produkt
          </label>
        </div>
      </div>

      {/* PREVIEW */}

      <div
        className="create-item-preview-panel"
        onMouseMove={onDrag}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        <div className="preview-card">
          <div className="image-frame landscape" ref={listFrame}>
            {preview1 && renderImage(preview1, zoom1, offset1, "img1", !image1)}
          </div>

          <div className="list-content">
            <h4>{name}</h4>
            <p>{productDescription}</p>
          </div>
        </div>

        <div className="preview-card product-preview">
          <div className="product-header">
            <button className="book-now-button">Boka nu</button>
            <div className="price">{pricePerDay} SEK / dag</div>
          </div>

          <div className="product-main">
            <div className="image-frame product" ref={productFrame}>
              {preview2 &&
                renderImage(preview2, zoom2, offset2, "img2", !image2)}
            </div>

            <div className="product-text">
              <h2>{name}</h2>
              <p>{productDescription}</p>
            </div>
          </div>

          <div className="product-bottom">
            <div className="product-spec">
              <h4>Specifikation</h4>
              <p>{productSpecification}</p>
            </div>

            {getYoutubeId(youtubeUrl) && (
              <div className="product-video">
                <iframe
                  src={`https://www.youtube.com/embed/${getYoutubeId(youtubeUrl)}`}
                  title="YouTube video"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
