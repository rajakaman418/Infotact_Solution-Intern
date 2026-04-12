import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";

export default function POS() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  const token = localStorage.getItem("token");

  // 🔥 FETCH PRODUCTS
  const fetchProducts = async () => {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/products`,
      {
        headers: { Authorization: token },
      }
    );
    setProducts(res.data.products);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔥 ADD TO CART
  const addToCart = (product) => {
    const exist = cart.find((item) => item._id === product._id);

    if (exist) {
      setCart(
        cart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // 🔥 INCREASE QTY
  const increaseQty = (id) => {
    setCart(
      cart.map((item) =>
        item._id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // 🔥 DECREASE QTY
  const decreaseQty = (id) => {
    setCart(
      cart
        .map((item) =>
          item._id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // 🔥 REMOVE ITEM
  const removeItem = (id) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  // 🔥 TOTAL CALCULATION
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 🔥 CHECKOUT
  const checkout = async () => {
    try {
      const items = cart.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      }));

      await axios.post(
        `${process.env.REACT_APP_API_URL}/orders`,
        { items },
        {
          headers: { Authorization: token },
        }
      );

      generateInvoice();
      alert("Order placed successfully!");
      setCart([]);

    } catch (error) {
      alert(error.response?.data?.error || "Checkout failed");
    }
  };

  // 🔥 GENERATE PDF INVOICE
  const generateInvoice = () => {
    const doc = new jsPDF();

    doc.text("POS Invoice", 20, 20);

    let y = 40;

    cart.forEach((item) => {
      doc.text(
        `${item.name} x ${item.quantity} = ₹${item.price * item.quantity}`,
        20,
        y
      );
      y += 10;
    });

    doc.text(`Total: ₹${total}`, 20, y + 10);

    doc.save("invoice.pdf");
  };

  return (
    <div>

      <h1 className="text-2xl font-bold mb-4">POS System</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* PRODUCTS */}
        <div>
          <h2 className="font-semibold mb-2">Products</h2>

          {products.map((p) => (
            <div
              key={p._id}
              className="bg-white p-3 mb-2 shadow flex justify-between"
            >
              <span>{p.name} - ₹{p.price}</span>

              <button
                onClick={() => addToCart(p)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Add
              </button>
            </div>
          ))}
        </div>

        {/* CART */}
        <div>
          <h2 className="font-semibold mb-2">Cart</h2>

          {cart.length === 0 && (
            <p className="text-gray-500">Cart is empty</p>
          )}

          {cart.map((item) => (
            <div
              key={item._id}
              className="bg-white p-3 mb-2 shadow"
            >
              <div className="flex justify-between">
                <span>{item.name}</span>
                <button
                  onClick={() => removeItem(item._id)}
                  className="text-red-500"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center mt-2">
                <button
                  onClick={() => decreaseQty(item._id)}
                  className="px-2 bg-gray-300"
                >
                  -
                </button>

                <span className="px-3">{item.quantity}</span>

                <button
                  onClick={() => increaseQty(item._id)}
                  className="px-2 bg-gray-300"
                >
                  +
                </button>
              </div>

              <p className="mt-1 text-sm">
                ₹ {item.price * item.quantity}
              </p>
            </div>
          ))}

          {/* TOTAL */}
          <h3 className="mt-4 text-xl font-bold">
            Total: ₹ {total}
          </h3>

          {/* CHECKOUT */}
          <button
            onClick={checkout}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded w-full"
          >
            Checkout
          </button>

        </div>

      </div>

    </div>
  );
}