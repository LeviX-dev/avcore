import { useState, useEffect } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { BASE_URL } from '../../../public/config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faPlus
} from '@fortawesome/free-solid-svg-icons';

import AddProductTypeForm from './AddProductTypeForm';
import AddBrandForm from './AddBrandForm';
import AddModelForm from './AddModelForm';
import EditProductForm from './EditProductForm';

interface Model {
  model_id: number;
  model_no: string;
  description: string;
  price: string;
  image_path: string;
}

interface Brand {
  brand_id: number;
  brand_name: string;
  product_type_id: number;
  models?: Model[];
}

interface ProductType {
  product_type_id: number;
  product_type_name: string;
  quotation_type: string;
  brands?: Brand[];
  brandCount?: number;
  modelCount?: number;
}

const Product = () => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [filteredData, setFilteredData] = useState<ProductType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [showAddProductTypePopup, setShowAddProductTypePopup] = useState(false);
  const [showAddBrandPopup, setShowAddBrandPopup] = useState(false);
  const [showAddModelPopup, setShowAddModelPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);

  const [selectedProductType, setSelectedProductType] = useState<ProductType | null>(null);
  const [selectedProductTypeForModel, setSelectedProductTypeForModel] =
    useState<ProductType | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProductTypes();
  }, []);

  const fetchProductTypes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(BASE_URL + 'api/product');

      const data = res.data.map((pt: ProductType) => ({
        ...pt,
        brandCount: pt.brands?.length || 0,
        modelCount:
          pt.brands?.reduce((t, b) => t + (b.models?.length || 0), 0) || 0
      }));

      setProductTypes(data);
      setFilteredData(data);
    } finally {
      setLoading(false);
    }
  };

  const refreshProductType = async (id: number) => {
    const res = await axios.get(`${BASE_URL}api/product/${id}/details`);
    const pt = res.data;

    const updated = {
      ...pt,
      brandCount: pt.brands?.length || 0,
      modelCount:
        pt.brands?.reduce(
          (t: number, b: Brand) => t + (b.models?.length || 0),
          0
        ) || 0
    };

    setProductTypes(prev =>
      prev.map(p => (p.product_type_id === id ? updated : p))
    );
    setFilteredData(prev =>
      prev.map(p => (p.product_type_id === id ? updated : p))
    );
  };

  const handleSearch = () => {
    setFilteredData(
      productTypes.filter(p =>
        p.product_type_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  return (
    <div className="px-2 sm:px-4">
      <Breadcrumb pageName="Manage Products" />

      {/* HEADER */}
      <div className="bg-white border rounded-lg p-4 mb-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search..."
          className="border px-3 py-2 rounded-md text-sm w-full sm:w-64"
        />

        <button
          onClick={() => setShowAddProductTypePopup(true)}
          className="bg-primary text-white px-3 py-2 rounded-md text-sm flex items-center justify-center gap-1 w-full sm:w-auto"
        >
          <FontAwesomeIcon icon={faPlus} /> Add Product Type
        </button>
      </div>

      {/* POPUPS */}
      {showAddProductTypePopup && (
        <AddProductTypeForm
          onClose={() => setShowAddProductTypePopup(false)}
          onSuccess={() => {
            fetchProductTypes();
            setShowAddProductTypePopup(false);
          }}
        />
      )}

      {showAddBrandPopup && selectedProductType && (
        <AddBrandForm
          productTypeId={selectedProductType.product_type_id}
          brands={selectedProductType.brands || []}
          onClose={() => {
            setShowAddBrandPopup(false);
            setSelectedProductType(null);
          }}
          onSuccess={(id) => {
            refreshProductType(id);
            setShowAddBrandPopup(false);
            setSelectedProductType(null);
          }}
        />
      )}

      {showAddModelPopup && selectedProductTypeForModel && (
        <AddModelForm
          brands={selectedProductTypeForModel.brands || []}
          onClose={() => {
            setShowAddModelPopup(false);
            setSelectedProductTypeForModel(null);
          }}
          onSuccess={() => {
            refreshProductType(
              selectedProductTypeForModel.product_type_id
            );
            setShowAddModelPopup(false);
            setSelectedProductTypeForModel(null);
          }}
        />
      )}

      {showEditPopup && selectedProductType && (
        <EditProductForm
          productType={selectedProductType}
          onClose={() => setShowEditPopup(false)}
          onSuccess={fetchProductTypes}
        />
      )}

      {/* TABLE */}
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full min-w-[900px] table-fixed">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-center w-16 text-sm">SrNo.</th>
              <th className="p-3 text-left w-1/4 text-sm">Product Type</th>
              <th className="p-3 text-left w-1/4 text-sm">Category</th>
              <th className="p-3 text-center w-1/6 text-sm">Brands</th>
              <th className="p-3 text-center w-1/6 text-sm">Models</th>
              <th className="p-3 text-center w-32 text-sm">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((pt, i) => (
              <tr key={pt.product_type_id} className="border-t hover:bg-gray-50">
                <td className="p-3 text-center">{i + 1}</td>
                <td className="p-3">{pt.product_type_name}</td>
                <td className="p-3">{pt.quotation_type}</td>

                <td className="p-3 text-center">
                  <div className="flex gap-2 items-center justify-center">
                    <b>{pt.brandCount}</b>
                    <button
                      onClick={() => {
                        setSelectedProductType(pt);
                        setShowAddBrandPopup(true);
                      }}
                      className="p-1 bg-green-600 rounded"
                    >
                      <FontAwesomeIcon icon={faPlus} className="text-white text-xs" />
                    </button>
                  </div>
                </td>

                <td className="p-3 text-center">
                  <div className="flex gap-2 items-center justify-center">
                    <b>{pt.modelCount}</b>
                    <button
                      onClick={() => {
                        setSelectedProductTypeForModel(pt);
                        setShowAddModelPopup(true);
                      }}
                      className="p-1 bg-blue-600 rounded"
                    >
                      <FontAwesomeIcon icon={faPlus} className="text-white text-xs" />
                    </button>
                  </div>
                </td>

                <td className="p-3 text-center">
                  <button
                    onClick={() => {
                      setSelectedProductType(pt);
                      setShowEditPopup(true);
                    }}
                    className="bg-green-600 p-2 rounded inline-flex"
                  >
                    <FontAwesomeIcon icon={faEdit} className="text-white" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Product;