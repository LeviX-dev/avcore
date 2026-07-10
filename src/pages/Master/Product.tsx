import { useState, useEffect } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { BASE_URL } from '../../../public/config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faPlus,
  faLayerGroup,
  faSearch,
  faBars,
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
  cat_id: number;
  cat_name?: string;
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [selectedProductType, setSelectedProductType] =
    useState<ProductType | null>(null);
  const [selectedProductTypeForModel, setSelectedProductTypeForModel] =
    useState<ProductType | null>(null);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const init = async () => {
      await fetchCategories();
      await fetchProductTypes();
    };
    init();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(BASE_URL + 'api/customised-categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProductTypes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(BASE_URL + 'api/product');
      
      // Categories should already be loaded
      const data = res.data.map((pt: ProductType) => {
        return {
          ...pt,
          cat_name: pt.cat_name || categories.find((c: any) => c.cat_id === pt.cat_id)?.cat_name || "-",
          brandCount: pt.brands?.length || 0,
          modelCount: pt.brands?.reduce((t, b) => t + (b.models?.length || 0), 0) || 0,
        };
      });

      setProductTypes(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProductType = async (id: number) => {
    try {
      const res = await axios.get(`${BASE_URL}api/product/${id}/details`);
      const pt = res.data;
      
      const updated = {
        ...pt,
        cat_name: pt.cat_name || categories.find((c: any) => c.cat_id === pt.cat_id)?.cat_name || "-",
        brandCount: pt.brands?.length || 0,
        modelCount: pt.brands?.reduce(
          (t: number, b: Brand) => t + (b.models?.length || 0),
          0,
        ) || 0,
      };

      setProductTypes((prev) =>
        prev.map((p) => (p.product_type_id === id ? updated : p)),
      );
      setFilteredData((prev) =>
        prev.map((p) => (p.product_type_id === id ? updated : p)),
      );
    } catch (error) {
      console.error('Error refreshing product type:', error);
    }
  };

  const handleSearch = () => {
    setFilteredData(
      productTypes.filter((p) =>
        p.product_type_name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  };

  return (
    <div className="p-4 md:p-6 dark:bg-boxdark">
      <Breadcrumb pageName="Manage Products" />

      {/* HEADER - RESPONSIVE */}
      <div className="bg-white dark:bg-boxdark border dark:border-strokedark rounded-lg p-4 mb-4 md:mb-6 flex flex-col md:flex-row justify-between gap-4">
        {/* Mobile header with hamburger menu */}
        <div className="flex md:hidden justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-black dark:text-white">Products</h2>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 text-black dark:text-white"
          >
            <FontAwesomeIcon icon={faBars} className="text-xl" />
          </button>
        </div>

        {/* Search and buttons - visible on desktop, conditionally on mobile */}
        <div className={`${showMobileMenu ? 'block' : 'hidden'} md:flex md:flex-row md:gap-2 space-y-2 md:space-y-0`}>
          <div className="relative flex-grow">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search product types..."
              className="border border-gray-300 dark:border-strokedark dark:bg-boxdark dark:text-white px-4 py-2 rounded-lg w-full text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 md:hidden text-black dark:text-white"
            >
              <FontAwesomeIcon icon={faSearch} className="text-gray-500 dark:text-gray-300" />
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setShowAddProductTypePopup(true)}
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm md:text-base flex items-center justify-center gap-2 transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Add Product Type</span>
            </button>
          </div>
        </div>
        
        {/* Desktop-only search button */}
        <button
          onClick={handleSearch}
          className="hidden md:inline-flex items-center justify-center bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm md:text-base gap-2 transition-colors"
        >
          <FontAwesomeIcon icon={faSearch} />
          <span>Search</span>
        </button>
      </div>

      {/* POPUPS */}
      {showAddProductTypePopup && (
        <AddProductTypeForm
          categories={categories}
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
            refreshProductType(selectedProductTypeForModel.product_type_id);
            setShowAddModelPopup(false);
            setSelectedProductTypeForModel(null);
          }}
        />
      )}

      {showEditPopup && selectedProductType && (
        <EditProductForm
          productType={selectedProductType}
          categories={categories}
          onClose={() => setShowEditPopup(false)}
          onSuccess={fetchProductTypes}
        />
      )}

      {/* TABLE - RESPONSIVE */}
      <div className="bg-white dark:bg-boxdark border dark:border-strokedark rounded-lg overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-gray-100 dark:bg-meta-4">
              <tr>
                <th className="p-4 text-left w-16 text-black dark:text-white">SrNo.</th>
                <th className="p-4 text-left min-w-[200px] text-black dark:text-white">Product Type</th>
                <th className="p-4 text-left min-w-[150px] text-black dark:text-white">Subject</th>
                <th className="p-4 text-center min-w-[100px] text-black dark:text-white">Brands</th>
                <th className="p-4 text-center min-w-[100px] text-black dark:text-white">Models</th>
                <th className="p-4 text-center w-32 text-black dark:text-white">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((pt, i) => (
                <tr
                  key={pt.product_type_id}
                  className="border-t dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="p-4 align-middle text-black dark:text-white">{i + 1}</td>
                  <td className="p-4 align-middle font-medium text-black dark:text-white">{pt.product_type_name}</td>
                  <td className="p-4 align-middle text-black dark:text-white">{pt.cat_name || '-'}</td>

                  <td className="p-4 align-middle">
                    <div className="flex gap-2 items-center justify-center">
                      <span className="font-bold min-w-6 text-black dark:text-white">{pt.brandCount}</span>
                      <button
                        onClick={() => {
                          setSelectedProductType(pt);
                          setShowAddBrandPopup(true);
                        }}
                        className="p-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors"
                        title="Add Brand"
                      >
                        <FontAwesomeIcon
                          icon={faPlus}
                          className="text-white text-sm"
                        />
                      </button>
                    </div>
                  </td>

                  <td className="p-4 align-middle">
                    <div className="flex gap-2 items-center justify-center">
                      <span className="font-bold min-w-6 text-black dark:text-white">{pt.modelCount}</span>
                      <button
                        onClick={() => {
                          setSelectedProductTypeForModel(pt);
                          setShowAddModelPopup(true);
                        }}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                        title="Add Model"
                      >
                        <FontAwesomeIcon
                          icon={faPlus}
                          className="text-white text-sm"
                        />
                      </button>
                    </div>
                  </td>

                  <td className="p-4 align-middle">
                    <button
                      onClick={() => {
                        setSelectedProductType(pt);
                        setShowEditPopup(true);
                      }}
                      className="bg-green-600 hover:bg-green-700 p-3 rounded-lg inline-flex items-center justify-center transition-colors"
                      title="Edit Product Type"
                    >
                      <FontAwesomeIcon icon={faEdit} className="text-white" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4 p-4">
          {filteredData.map((pt, i) => (
            <div key={pt.product_type_id} className="border dark:border-strokedark rounded-lg p-4 bg-white dark:bg-boxdark shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-600 dark:text-gray-300">#{i + 1}</span>
                    <h3 className="font-semibold text-lg text-black dark:text-white">{pt.product_type_name}</h3>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    <span className="text-sm">Category: </span>
                    <span className="font-medium">{pt.cat_name || '-'}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedProductType(pt);
                    setShowEditPopup(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 p-2 rounded-lg transition-colors"
                  title="Edit"
                >
                  <FontAwesomeIcon icon={faEdit} className="text-white" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-300">Brands</div>
                      <div className="font-bold text-xl text-black dark:text-white">{pt.brandCount}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProductType(pt);
                        setShowAddBrandPopup(true);
                      }}
                      className="bg-green-600 hover:bg-green-700 p-2 rounded-full transition-colors"
                      title="Add Brand"
                    >
                      <FontAwesomeIcon icon={faPlus} className="text-white text-xs" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-300">Models</div>
                      <div className="font-bold text-xl text-black dark:text-white">{pt.modelCount}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProductTypeForModel(pt);
                        setShowAddModelPopup(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full transition-colors"
                      title="Add Model"
                    >
                      <FontAwesomeIcon icon={faPlus} className="text-white text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FontAwesomeIcon icon={faLayerGroup} className="text-4xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">No products found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm ? 'Try a different search term' : 'Get started by adding your first product type'}
          </p>
          <button
            onClick={() => setShowAddProductTypePopup(true)}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors"
          >
            Add Product Type
          </button>
        </div>
      )}
    </div>
  );
};

export default Product;