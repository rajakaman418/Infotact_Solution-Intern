import { useEffect, useState } from "react";
import AppShell from "../components/layout/AppShell";
import Topbar from "../components/layout/Topbar";
import { addStock } from "../api/inventory.api";
import { getProducts } from "../api/product.api";
import { getStores } from "../api/store.api";

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
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitial();
  }, []);

  const loadInitial = async () => {
    try {
      const [productData, storeData] = await Promise.all([
        getProducts({ page: 1, limit: 100, isActive: true }),
        getStores(),
      ]);

      setProducts(productData.items || []);
      setStores(storeData.items || storeData || []);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to load products/stores");
    }
  };

  const handleProductSelect = (productId) => {
    const product = products.find((p) => p._id === productId);
    const variant = product?.variants?.[0];

    setForm((prev) => ({
      ...prev,
      productId,
      variantId: variant?._id || "",
      sku: variant?.sku || "",
    }));
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.productId || !form.variantId || !form.sku || !form.storeId) {
      alert("Please select product and store");
      return;
    }

    try {
      setLoading(true);

      await addStock({
        productId: form.productId,
        variantId: form.variantId,
        sku: form.sku,
        storeId: form.storeId,
        quantity: Number(form.quantity),
        reorderPoint: Number(form.reorderPoint),
        note: form.note,
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
          <select
            value={form.productId}
            onChange={(e) => handleProductSelect(e.target.value)}
            required
          >
            <option value="">Select Product</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.title} - {product.brand}
              </option>
            ))}
          </select>

          <input type="text" value={form.variantId} placeholder="Variant ID" disabled />
          <input type="text" value={form.sku} placeholder="SKU" disabled />

          <select
            value={form.storeId}
            onChange={(e) => updateField("storeId", e.target.value)}
            required
          >
            <option value="">Select Store</option>
            {stores.map((store) => (
              <option key={store._id} value={store._id}>
                {store.name}
              </option>
            ))}
          </select>

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