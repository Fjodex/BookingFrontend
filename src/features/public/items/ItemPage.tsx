import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getItem } from "./api/itemsApi";
import type { Item } from "../../sharedTypes/Item";

import "./itemPage.css";

export default function ItemPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!itemId) return;
    getItem(itemId).then(setItem);
  }, [itemId]);

  if (!item) return <div className="item-page">Laddar...</div>;

  return (
    <div className="item-page">
      <div className="item-page__container">
        <div className="item-page__card">
          {/* HEADER */}
          <div className="item-page__header">
            <div className="item-page__header-right">
              <div className="item-page__price">
                {item.pricePerDay} SEK / dag
              </div>

              <button
                className="item-page__book-button"
                onClick={() => navigate(`/booking/${item.id}`)}
              >
                Boka nu
              </button>
            </div>
          </div>

          {/* MAIN */}
          <div className="item-page__main">
            <div className="item-page__image-frame">
              {item.imageData?.[1] ? (
                <img
                  src={`data:image/*;base64,${item.imageData[1]}`}
                  alt={item.name}
                />
              ) : item.imageData?.[0] ? (
                <img
                  src={`data:image/*;base64,${item.imageData[0]}`}
                  alt={item.name}
                />
              ) : (
                <div className="item-placeholder large" />
              )}
            </div>

            <div className="item-page__text">
              <h2>{item.name}</h2>
              <p>{item.productDescription}</p>
            </div>
          </div>

          {/* SPEC */}
          {item.productSpecification && (
            <div className="item-page__spec">
              <h4>Specifikation</h4>
              <p>{item.productSpecification}</p>
            </div>
          )}

          {/* VIDEO */}
          {item.youtubeVideoId && (
            <div className="item-page__video">
              <iframe
                src={`https://www.youtube.com/embed/${item.youtubeVideoId}`}
                title="Produktvideo"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
