import { useEffect, useState } from "react";
import { getProducts } from "../api/product.api";
import { getStores } from "../api/store.api";
import {
  checkoutOrder,
  downloadInvoicePdf,
  printInvoicePdf,
} from "../api/order.api";
import { useCart } from "../context/CartContext";
import ProductGrid from "../components/pos/ProductGrid";
import CartPanel from "../components/pos/CartPanel";
import AppShell from "../components/layout/AppShell";
import Topbar from "../components/layout/Topbar";

export default function POSPage() {
  const { items, addToCart, clearCart } = useCart();

  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [printingInvoice, setPrintingInvoice] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    loadInitial();
  }, []);

  const loadInitial = async () => {
    await Promise.all([loadStores(), loadProducts()]);
  };

  const loadStores = async () => {
    const data = await getStores();
    const storeItems = data.items || data || [];
    setStores(storeItems);

    if (storeItems.length) {
      setSelectedStore(storeItems[0]._id);
    }
  };

  const loadProducts = async (params = {}) => {
    const data = await getProducts(params);
    setProducts(data.items || []);
  };

  const applyFilters = async () => {
    await loadProducts({
      q: search,
      category,
      page: 1,
      limit: 20,
    });
  };

  const handleCheckout = async () => {
    if (!selectedStore) {
      alert("Please select a store");
      return;
    }

    if (!items.length) {
      alert("Cart is empty");
      return;
    }

    try {
      setLoadingCheckout(true);

      const payload = {
        storeId: selectedStore,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          sku: item.sku,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const data = await checkoutOrder(payload);
      setLastOrder(data.order);
      clearCart();

      alert(`Checkout successful\nOrder Number: ${data.order.orderNumber}`);
    } catch (err) {
      alert(err?.response?.data?.message || "Checkout failed");
    } finally {
      setLoadingCheckout(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!lastOrder?._id) return;

    try {
      setDownloadingInvoice(true);
      await downloadInvoicePdf(lastOrder._id);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to download invoice");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const handlePrintInvoice = async () => {
    if (!lastOrder?._id) return;

    try {
      setPrintingInvoice(true);
      await printInvoicePdf(lastOrder._id);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to print invoice");
    } finally {
      setPrintingInvoice(false);
    }
  };

  return (
    <AppShell>
      <Topbar
        title="Point of Sale"
        subtitle="Fast checkout and store operations"
      />

      {lastOrder && (
        <div className="success-banner">
          <div>
            <strong>Last Order:</strong> {lastOrder.orderNumber}
          </div>

          <div className="success-actions">
            <button
              className="secondary-btn"
              onClick={() => setLastOrder(null)}
            >
              Dismiss
            </button>

            <button
              className="secondary-btn"
              onClick={handlePrintInvoice}
              disabled={printingInvoice}
            >
              {printingInvoice ? "Printing..." : "Print"}
            </button>

            <button
              className="primary-btn"
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice}
            >
              {downloadingInvoice ? "Downloading..." : "Download Invoice"}
            </button>
          </div>
        </div>
      )}

      <div className="pos-layout">
        <section className="pos-content">
          <div className="toolbar-card">
            <div className="toolbar-grid">
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
              >
                {stores.map((store) => (
                  <option key={store._id} value={store._id}>
                    {store.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Search product, sku..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />

              <button className="primary-btn" onClick={applyFilters}>
                Search
              </button>
            </div>
          </div>

          <ProductGrid products={products} onAdd={addToCart} />
        </section>

        <CartPanel onCheckout={handleCheckout} loading={loadingCheckout} />
      </div>
    </AppShell>
  );
}