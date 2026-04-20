import { useEffect, useState } from "react";
import AppShell from "../components/layout/AppShell";
import Topbar from "../components/layout/Topbar";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/product.api";

const initialForm = {
  title: "",
  description: "",
  brand: "",
  category: "",
  variants: [
    {
      sku: "",
      price: "",
      size: "",
      color: "",
    },
  ],
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProducts(page, q, category, brand);
  }, [page]);

  const loadProducts = async (
    customPage = page,
    customQ = q,
    customCategory = category,
    customBrand = brand
  ) => {
    try {
      const data = await getProducts({
        page: customPage,
        limit: 8,
        q: customQ || undefined,
        category: customCategory || undefined,
        brand: customBrand || undefined,
      });

      setProducts(data.items || []);
      setPagination(data.pagination || null);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to load products");
    }
  };

  const applyFilters = async () => {
    setPage(1);
    await loadProducts(1, q, category, brand);
  };

  const clearFilters = async () => {
    setQ("");
    setCategory("");
    setBrand("");
    setPage(1);
    await loadProducts(1, "", "", "");
  };

  const openCreateForm = () => {
    setEditingProduct(null);
    setForm(initialForm);
    setShowForm(true);
  };

  const openEditForm = (product) => {
    const firstVariant = product.variants?.[0] || {
      sku: "",
      price: "",
      size: "",
      color: "",
    };

    setEditingProduct(product);
    setForm({
      title: product.title || "",
      description: product.description || "",
      brand: product.brand || "",
      category: product.category || "",
      variants: [
        {
          sku: firstVariant.sku || "",
          price: firstVariant.price || "",
          size: firstVariant.size || "",
          color: firstVariant.color || "",
        },
      ],
    });
    setShowForm(true);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVariantChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      variants: [
        {
          ...prev.variants[0],
          [field]: value,
        },
      ],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const payload = {
        ...form,
        variants: [
          {
            ...form.variants[0],
            price: Number(form.variants[0].price),
          },
        ],
      };

      if (editingProduct) {
        await updateProduct(editingProduct._id, payload);
        alert("Product updated successfully");
      } else {
        await createProduct(payload);
        alert("Product created successfully");
      }

      setShowForm(false);
      setEditingProduct(null);
      setForm(initialForm);
      await loadProducts(page, q, category, brand);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Archive this product?");
    if (!confirmed) return;

    try {
      await deleteProduct(id);
      alert("Product archived successfully");
      await loadProducts(page, q, category, brand);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to archive product");
    }
  };

  return (
    <AppShell>
      <Topbar
        title="Products"
        subtitle="Manage catalog, variants, filters, and pagination"
      />

      <div className="panel">
        <div className="products-toolbar">
          <input
            type="text"
            placeholder="Search by title or SKU"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <input
            type="text"
            placeholder="Brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />

          <button className="primary-btn" onClick={applyFilters}>
            Search
          </button>

          <button className="secondary-btn" onClick={clearFilters}>
            Clear
          </button>

          <button className="primary-btn" onClick={openCreateForm}>
            Add Product
          </button>
        </div>

        {!products.length ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try changing filters or create a new product.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => {
              const firstVariant = product.variants?.[0];

              return (
                <div key={product._id} className="product-card">
                  <div className="product-card-head">
                    <h3>{product.title}</h3>
                    <span className="badge">{product.category}</span>
                  </div>

                  <p className="muted-text">{product.brand}</p>
                  <p className="product-description">{product.description}</p>

                  {firstVariant && (
                    <div className="variant-box">
                      <div>SKU: {firstVariant.sku}</div>
                      <div>₹ {firstVariant.price}</div>
                      <div>
                        {firstVariant.size || "-"} / {firstVariant.color || "-"}
                      </div>
                    </div>
                  )}

                  <div className="product-actions">
                    <button
                      className="primary-btn"
                      onClick={() => openEditForm(product)}
                    >
                      Edit
                    </button>

                    <button
                      className="danger-btn"
                      onClick={() => handleDelete(product._id)}
                    >
                      Archive
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pagination && (
          <div className="pagination-bar">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={!pagination.hasPrevPage}
            >
              Previous
            </button>

            <span>
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-head">
              <h2>{editingProduct ? "Edit Product" : "Create Product"}</h2>
              <button className="icon-btn" onClick={() => setShowForm(false)}>
                ×
              </button>
            </div>

            <form className="product-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Description"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Brand"
                value={form.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Category"
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="SKU"
                value={form.variants[0].sku}
                onChange={(e) => handleVariantChange("sku", e.target.value)}
                required
              />

              <input
                type="number"
                placeholder="Price"
                value={form.variants[0].price}
                onChange={(e) => handleVariantChange("price", e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Size"
                value={form.variants[0].size}
                onChange={(e) => handleVariantChange("size", e.target.value)}
              />

              <input
                type="text"
                placeholder="Color"
                value={form.variants[0].color}
                onChange={(e) => handleVariantChange("color", e.target.value)}
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting
                    ? "Saving..."
                    : editingProduct
                    ? "Update Product"
                    : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}