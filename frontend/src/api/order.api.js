import client from "./client";

export const checkoutOrder = async (payload) => {
  const { data } = await client.post("/orders/checkout", payload);
  return data;
};

export const getOrders = async (params = {}) => {
  const { data } = await client.get("/orders", { params });
  return data;
};

export const refundOrder = async (orderId) => {
  const { data } = await client.post(`/orders/${orderId}/refund`);
  return data;
};

export const downloadInvoicePdf = async (orderId) => {
  const response = await client.get(`/invoices/${orderId}/pdf`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);

  let filename = `invoice-${orderId}.pdf`;
  const disposition = response.headers["content-disposition"];

  if (disposition) {
    const match = disposition.match(/filename="(.+)"/);
    if (match?.[1]) {
      filename = match[1];
    }
  }

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
};

export const printInvoicePdf = async (orderId) => {
  const response = await client.get(`/invoices/${orderId}/pdf`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);

  const printWindow = window.open(url, "_blank");

  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};