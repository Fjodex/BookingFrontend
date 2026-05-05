import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createAdminItem } from "../api/adminItemApi";
import "./createItem.css";

type Offset = { x: number; y: number };
type ImgSize = { w: number; h: number };

export default function CreateItemPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productSpecification, setProductSpecification] = useState("");
  const [details, setDetails] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [pricePerDay, setPricePerDay] = useState(0);
  const [color, setColor] = useState("#96b97e");

  const [isActive, setIsActive] = useState(true);

  const [image1, setImage1] = useState<string>("");
  const [image2, setImage2] = useState<string>("");

  const [zoom1, setZoom1] = useState(1);
  const [zoom2, setZoom2] = useState(1);

  const [minZoom1, setMinZoom1] = useState(1);
  const [minZoom2, setMinZoom2] = useState(1);

  const [imgSize1, setImgSize1] = useState<ImgSize>({ w: 1, h: 1 });
  const [imgSize2, setImgSize2] = useState<ImgSize>({ w: 1, h: 1 });

  const [offset1, setOffset1] = useState<Offset>({ x: 0, y: 0 });
  const [offset2, setOffset2] = useState<Offset>({ x: 0, y: 0 });

  const [dragging, setDragging] = useState<null | "img1" | "img2">(null);
  const dragStart = useRef({ x: 0, y: 0 });

  const listFrame = useRef<HTMLDivElement>(null);
  const productFrame = useRef<HTMLDivElement>(null);

  /* ---------------- CLAMP ---------------- */

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

    return {
      x: Math.min(0, Math.max(frameW - scaledW, offset.x)),
      y: Math.min(0, Math.max(frameH - scaledH, offset.y)),
    };
  }

  /* ---------------- IMAGE LOAD ---------------- */

  async function handleImage(
    file: File | undefined,
    setImage: React.Dispatch<React.SetStateAction<string>>,
    setZoom: React.Dispatch<React.SetStateAction<number>>,
    setOffset: React.Dispatch<React.SetStateAction<Offset>>,
    setMinZoom: React.Dispatch<React.SetStateAction<number>>,
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
      setMinZoom(zoom);
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

  /* ---------------- CROP IMAGE ---------------- */

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

  /* ---------------- Fix embedded format ---------------- */
  function getYoutubeId(url: string): string | null {
    try {
      const parsed = new URL(url);

      // https://www.youtube.com/watch?v=VIDEO_ID
      if (parsed.hostname.includes("youtube.com")) {
        return parsed.searchParams.get("v");
      }

      // https://youtu.be/VIDEO_ID
      if (parsed.hostname.includes("youtu.be")) {
        return parsed.pathname.slice(1);
      }

      return null;
    } catch {
      return null;
    }
  }

  /* ---------------- SAVE ---------------- */

  async function save() {
    const cropped1 = await cropImage(image1, zoom1, offset1, listFrame.current);

    const cropped2 = await cropImage(
      image2,
      zoom2,
      offset2,
      productFrame.current,
    );

    const images: string[] = [];

    if (cropped1) images[0] = cropped1;
    if (cropped2) images[1] = cropped2;
    else if (cropped1) images[1] = cropped1;

    try {
      await createAdminItem({
        name,
        details,
        productDescription,
        productSpecification,
        imageData: images,
        imageAspect: 1,
        youtubeVideoId: getYoutubeId(youtubeUrl) || undefined,
        pricePerDay,
        color,
        isActive,
      });

      navigate("/admin");
    } catch (err) {
      console.error(err);
      alert("Det gick inte att skapa produkten");
    }
  }

  function cancel() {
    navigate("/admin");
  }

  /* ---------------- RENDER IMAGE ---------------- */

  function renderImage(
    img: string,
    zoom: number,
    offset: Offset,
    type: "img1" | "img2",
  ) {
    return (
      <img
        src={img}
        alt=""
        draggable={false}
        onMouseDown={(e) => startDrag(e, type)}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          cursor: "grab",
        }}
      />
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="create-item-layout">
      <div className="create-item-form-panel">
        <h2>Ny produkt</h2>

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
            placeholder="https://youtube.com/..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
          />
        </div>

        <div className="form-section">
          <label>Pris per dag</label>
          <input
            type="number"
            step="0.01"
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

        {/* LIST IMAGE */}

        <div className="form-section">
          <label>Listbild</label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              handleImage(
                e.target.files?.[0],
                setImage1,
                setZoom1,
                setOffset1,
                setMinZoom1,
                setImgSize1,
                listFrame.current,
              )
            }
          />

          <label>Zoom</label>

          <input
            type="range"
            min="0.2"
            max="3"
            step="0.05"
            value={zoom1}
            onChange={(e) => {
              const z = Math.max(minZoom1, Number(e.target.value));
              setZoom1(z);
              if (listFrame.current) {
                setOffset1((o) =>
                  clampOffset(o, z, imgSize1, listFrame.current!),
                );
              }
            }}
          />
        </div>

        {/* PRODUCT IMAGE */}

        <div className="form-section">
          <label>Produktbild</label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              handleImage(
                e.target.files?.[0],
                setImage2,
                setZoom2,
                setOffset2,
                setMinZoom2,
                setImgSize2,
                productFrame.current,
              )
            }
          />

          <label>Zoom</label>

          <input
            type="range"
            min="0.2"
            max="3"
            step="0.05"
            value={zoom2}
            onChange={(e) => {
              const z = Math.max(minZoom2, Number(e.target.value));
              setZoom2(z);
              if (productFrame.current) {
                setOffset2((o) =>
                  clampOffset(o, z, imgSize2, productFrame.current!),
                );
              }
            }}
          />
        </div>

        <div className="form-buttons">
          <button className="btn-primary" onClick={save}>
            Skapa produkt
          </button>

          <button className="btn-cancel" onClick={cancel}>
            Avbryt
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
            {image1 && renderImage(image1, zoom1, offset1, "img1")}
          </div>

          <div className="list-content">
            <h4>{name || "Produktnamn"}</h4>
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
              {image2 && renderImage(image2, zoom2, offset2, "img2")}
            </div>

            <div className="product-text">
              <h2>{name || "Produktnamn"}</h2>
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
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
