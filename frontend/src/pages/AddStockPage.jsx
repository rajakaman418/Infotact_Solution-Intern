import { useState } from "react";
import AppShell from "../components/layout/AppShell";
import Topbar from "../components/layout/Topbar";
import { addStock } from "../api/inventory.api";

const initialForm = {
  productId: "",
  variantId: "",
  sku: "",
  storeId: "",
  quantity: "",
  reorderPoint: "",
  note: "",
};

export default function AddStockPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await addStock({
        ...form,
        quantity: Number(form.quantity),
        reorderPoint: Number(form.reorderPoint),
      });

      alert("Stock added successfully");
      setForm(initialForm);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to add stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <Topbar title="Add Stock" subtitle="Increase inventory for a product variant" />

      <div className="panel">
        <form className="product-form" onSubmit={submit}>
          <input
            type="text"
            placeholder="Product ID"
            value={form.productId}
            onChange={(e) => updateField("productId", e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Variant ID"
            value={form.variantId}
            onChange={(e) => updateField("variantId", e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="SKU"
            value={form.sku}
            onChange={(e) => updateField("sku", e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Store ID"
            value={form.storeId}
            onChange={(e) => updateField("storeId", e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) => updateField("quantity", e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Reorder Point"
            value={form.reorderPoint}
            onChange={(e) => updateField("reorderPoint", e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Note"
            value={form.note}
            onChange={(e) => updateField("note", e.target.value)}
          />

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Stock"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}