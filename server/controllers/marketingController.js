import {getFollowups, getMktProducts,updateStatusById} from '../models/marketingModel.js';

// Fetch products with category names
export const getFollowupController = async (req, res) => {
  try {
    const products = await getFollowups();
    res.status(200).json(products); // Return products with category names
  } catch (error) {
    console.error("Error fetching followup data:", error);
    res.status(500).json({ error: 'Failed to fetch followup data' });
  }
};

// Fetch products with category names
export const getMktProductsContoller = async (req, res) => {
    try {
      const products = await getMktProducts();
      res.status(200).json(products); // Return products with category names
    } catch (error) {
      console.error("Error fetching marketing Products data:", error);
      res.status(500).json({ error: 'Failed to fetch Marketing products data' });
    }
  };

// Controller to handle status update
export const updateMktProductStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const result = await updateStatusById(id, status);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
