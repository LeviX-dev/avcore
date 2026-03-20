import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config.js";

const cell = "px-4 py-4 align-middle text-base"; // text-base for normal cells

/* 🔥 IMAGE-STYLE SQUARE BADGE WITH SOFT ROUNDED CORNERS */
const badge =
  "inline-flex items-center justify-center h-[36px] min-w-[120px] px-4 rounded-lg text-sm font-semibold border whitespace-nowrap"; // text-sm for badges

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [modalContent, setModalContent] = useState(""); // for popup
  const [showModal, setShowModal] = useState(false);
  

  const fetchStock = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}api/stock/list`);
      setProducts(res.data?.data || []);
    } catch (err) {
      console.error("❌ Fetch Stock Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshStock = async () => {
    setSyncing(true);
    try {
      await axios.post(`${BASE_URL}api/stock/sync`);
      await fetchStock();
    } catch (err) {
      console.error("❌ Stock Sync Error:", err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const filteredProducts = products.filter((item) =>
    `${item.brand_name || ""} ${item.product_type_name || ""} ${item.model_name || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const updateQty = async (item, newQty) => {
    if (newQty < 0 || newQty === item.quentity) return;
    setUpdatingId(item.sid);

    try {
      const res = await axios.post(`${BASE_URL}api/stock/update-quantity`, {
        sid: item.sid,
        quentity: newQty,
      });

      if (res.data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.sid === item.sid ? { ...p, quentity: newQty } : p))
        );
      }
    } catch (err) {
      console.error("❌ Quantity Update Error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // function to truncate text
  const truncateText = (text, maxLength = 40) => {
    if (!text) return "-";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
    <div className="bg-[#f4f6fb] min-h-screen p-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Stock Master</h2>

          <div className="flex gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search model, brand..."
              className="border px-4 py-2 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={refreshStock}
              disabled={syncing}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-base font-medium"
            >
              {syncing ? "Refreshing..." : "🔄 Refresh"}
            </button>
          </div>
        </div>

        {/* TABLE */}
        <table className="w-full text-base border-separate border-spacing-y-3">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-base">
              <th className="px-4 py-3 rounded-l-xl">#</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 rounded-r-xl">Quantity</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredProducts.length ? (
              filteredProducts.map((item, index) => (
                <tr
                  key={item.sid}
                  className="bg-white shadow-sm hover:shadow-md hover:bg-gray-100 transition rounded-xl"
                >
                  <td className={`${cell} font-medium text-gray-600`}>{index + 1}</td>

                  {/* MODEL */}
                  <td className={cell}>
                    <span className={`${badge} bg-blue-100 text-blue-700 border-blue-300`}>
                      {item.model_name || "—"}
                    </span>
                  </td>

                  {/* BRAND */}
                  <td className={cell}>
                    <span className={`${badge} bg-purple-100 text-purple-700 border-purple-300`}>
                      {item.brand_name || "—"}
                    </span>
                  </td>

                  {/* PRODUCT */}
                  <td className={cell}>
                    <span className={`${badge} bg-orange-100 text-orange-700 border-orange-300`}>
                      {item.product_type_name || "—"}
                    </span>
                  </td>

                  {/* DESCRIPTION */}
                  <td className={`${cell} text-gray-600 text-sm`}>
                    {truncateText(item.model_description, 40)}{" "}
                    {item.model_description && item.model_description.length > 40 && (
                      <button
                        className="text-blue-600 hover:underline ml-1 text-sm"
                        onClick={() => {
                          setModalContent(item.model_description);
                          setShowModal(true);
                        }}
                      >
                        Read More
                      </button>
                    )}
                  </td>

                  {/* QUANTITY */}
                  <td className={cell}>
                    <input
                      type="number"
                      min="0"
                      defaultValue={item.quentity}
                      disabled={updatingId === item.sid}
                      onBlur={(e) => updateQty(item, Number(e.target.value))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          updateQty(item, Number(e.target.value));
                          e.target.blur();
                        }
                      }}
                      className="h-[36px] w-[90px] text-center rounded-lg bg-green-100 border border-green-300 text-green-700 font-semibold text-base focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-1/2 max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Description</h3>
            <p className="text-gray-700">{modalContent}</p>
            <div className="mt-6 flex justify-end">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;