import { useNavigate } from "react-router-dom";
import type { Item } from "../../../sharedTypes/Item";
import "./adminItemBox.css";

export default function AdminItemsBox({
  items = [],
  visibleItemIds,
  onToggle,
}: {
  items?: Item[];
  visibleItemIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="panel admin-items-box">
      <div className="items-header">
        <h3 className="items-title">Items</h3>

        <button
          className="add-item-icon-button"
          onClick={() => navigate("/admin/items/new")}
        >
          +
        </button>
        <h3>Visa/Dölj</h3>
      </div>

      <div className="items-list">
        {items.map((item) => (
          <div
            key={item.id}
            className="admin-item-row"
            onClick={() => navigate(`/admin/items/${item.id}`)}
          >
            <span
              className="item-color"
              style={{ backgroundColor: item.color }}
            />

            <span className={`item-name ${!item.isActive ? "inactive" : ""}`}>
              {item.name}
            </span>

            <input
              type="checkbox"
              className="item-checkbox"
              checked={visibleItemIds.has(item.id)}
              onClick={(e) => e.stopPropagation()}
              onChange={() => onToggle(item.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
