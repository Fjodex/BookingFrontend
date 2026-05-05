import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getItems } from "./api/itemsApi";
import type { Item } from "../../sharedTypes/Item";

import "./itemListPage.css";

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getItems().then(setItems);
  }, []);

  return (
    <div className="items-page">
      <h1 className="items-title">Tillgängliga produkter</h1>

      <div className="items-grid">
        {items.map((item) => (
          <div
            key={item.id}
            className="item-preview-card"
            onClick={() => navigate(`/items/${item.id}`)}
          >
            <div className="item-preview-image landscape">
              {item.imageData?.[0] ? (
                <img
                  src={`data:image/*;base64,${item.imageData[0]}`}
                  alt={item.name}
                />
              ) : (
                <div className="item-placeholder" />
              )}
            </div>

            <div className="item-preview-content">
              <h3>{item.name}</h3>
              <p className="item-preview-description">
                {item.productDescription}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
