import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import {
  Grid,
  Card,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Switch,
  FormControlLabel,
  Pagination,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

const CategoryCell = ({ value }) => <Chip label={value} color="primary" size="small" />;
CategoryCell.propTypes = {
  value: PropTypes.string.isRequired,
};

const PrescriptionCell = ({ value }) => (
  <Chip
    label={value ? "Required" : "Not Required"}
    color={value ? "error" : "success"}
    size="small"
  />
);
PrescriptionCell.propTypes = {
  value: PropTypes.bool.isRequired,
};

function Products() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [state, setState] = useState({
    products: [],
    loading: true,
    searchTerm: "",
    currentPage: 1,
    totalPages: 1,
    categories: [],
    selectedCategory: "all",
    snackbar: {
      open: false,
      message: "",
      severity: "success",
    },
  });

  const [dialogState, setDialogState] = useState({
    open: false,
    currentProduct: null,
  });

  const [authors, setAuthors] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [newProduct, setNewProduct] = useState({
    productName: "",
    mrp: 0,
    sellingPrice: 0,
    brand: "",
    vendorId: 1,
    productForm: "",
    uses: "",
    age: "",
    categoryId: 1,
    category: "",
    manufacturer: "",
    consumeType: "",
    expireDate: "",
    packagingDetails: "",
    images: [],
    variants: [],
    composition: "",
    productIntroduction: "",
    usesOfMedication: "",
    benefits: "",
    contradictions: "",
    isPrescriptionRequired: false,
    expertAdvice: "",
    substituteProducts: [],
    authorId: "",
    sub_category: "",
    direction_to_use: "",
    side_effects: "",
    precautions_while_using: "",
    descriptions: "",
    references: "",
    country_of_origin: "",
  });

  const baseUrl = process.env.REACT_APP_BASE_URL || "https://quickmeds.sndktech.online";
  const xAuthHeader =
    process.env.REACT_APP_X_AUTHORIZATION || "RGVlcGFrS3-VzaHdhaGE5Mzk5MzY5ODU0-QWxoblBvb2ph";

  const fetchCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/productCategory.get`, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data?.categories) {
        setState((prev) => ({ ...prev, categories: data.categories }));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Failed to load categories",
          severity: "error",
        },
      }));
    }
  }, [baseUrl, xAuthHeader]);

  const fetchAuthors = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/authors`, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data?.data) {
        setAuthors(data.data);
      }
    } catch (error) {
      console.error("Error fetching authors:", error);
      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Failed to load authors",
          severity: "error",
        },
      }));
    }
  }, [baseUrl, xAuthHeader]);

  const fetchProducts = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");

      let url = `${baseUrl}/product.get?page=${state.currentPage}`;
      if (state.selectedCategory !== "all") {
        url = `${baseUrl}/product.categoryGet?categoryId=${state.selectedCategory}&page=${state.currentPage}`;
      }

      const response = await fetch(url, {
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data?.products) {
        setState((prev) => ({
          ...prev,
          products: data.products,
          totalPages: data.totalPages || 1,
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        snackbar: {
          open: true,
          message: "Failed to load products",
          severity: "error",
        },
      }));
    }
  }, [state.currentPage, state.selectedCategory, baseUrl, xAuthHeader]);

  useEffect(() => {
    fetchCategories();
    fetchAuthors();
  }, [fetchCategories, fetchAuthors]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleBooleanChange = (e) => {
    const { name, checked } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: checked }));
  };

  const handleArrayChange = (e, field) => {
    const { value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [field]: value.split(",").map((item) => item.trim()),
    }));
  };

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      Array.from(files).forEach((file) => {
        uploadFormData.append("files", file);
      });

      const token = localStorage.getItem("token");

      const response = await fetch(`${baseUrl}/upload-files`, {
        method: "POST",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      const data = await response.json();

      if (response.ok && data?.files) {
        const uploadedUrls = data.files.map((file) => `${baseUrl}/${file}`);
        setNewProduct((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
        }));
      } else {
        setState((prev) => ({
          ...prev,
          snackbar: {
            open: true,
            message: data?.message || "Upload failed",
            severity: "error",
          },
        }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Upload failed. Please try again.",
          severity: "error",
        },
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setNewProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleCreateProduct = async () => {
    try {
      const token = localStorage.getItem("token");
      setState((prev) => ({ ...prev, loading: true }));

      if (
        !newProduct.productName ||
        !newProduct.mrp ||
        !newProduct.sellingPrice ||
        !newProduct.authorId
      ) {
        setState((prev) => ({
          ...prev,
          snackbar: {
            open: true,
            message: "Product Name, MRP, Selling Price and Author are required",
            severity: "warning",
          },
        }));
        return;
      }

      const productData = {
        productName: newProduct.productName,
        mrp: parseFloat(newProduct.mrp),
        sellingPrice: parseFloat(newProduct.sellingPrice),
        brand: newProduct.brand,
        vendorId: parseInt(newProduct.vendorId),
        productForm: newProduct.productForm,
        uses: newProduct.uses,
        age: newProduct.age,
        categoryId: parseInt(newProduct.categoryId),
        manufacturer: newProduct.manufacturer,
        consumeType: newProduct.consumeType,
        expireDate: newProduct.expireDate,
        packagingDetails: newProduct.packagingDetails,
        images: newProduct.images,
        variants: newProduct.variants,
        composition: newProduct.composition,
        productIntroduction: newProduct.productIntroduction,
        usesOfMedication: newProduct.usesOfMedication,
        benefits: newProduct.benefits,
        contradictions: newProduct.contradictions,
        isPrescriptionRequired: newProduct.isPrescriptionRequired,
        expertAdvice: newProduct.expertAdvice,
        substituteProducts: newProduct.substituteProducts,
        authorId: parseInt(newProduct.authorId),
        sub_category: newProduct.sub_category,
        direction_to_use: newProduct.direction_to_use,
        side_effects: newProduct.side_effects,
        precautions_while_using: newProduct.precautions_while_using,
        descriptions: newProduct.descriptions,
        references: newProduct.references,
        country_of_origin: newProduct.country_of_origin,
      };

      const response = await fetch(`${baseUrl}/product.add`, {
        method: "POST",
        headers: {
          "x-authorization": xAuthHeader,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to create product");

      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: "Product created successfully!",
          severity: "success",
        },
        currentPage: 1,
      }));

      setNewProduct({
        productName: "",
        mrp: 0,
        sellingPrice: 0,
        brand: "",
        vendorId: 1,
        productForm: "",
        uses: "",
        age: "",
        categoryId: 1,
        category: "",
        manufacturer: "",
        consumeType: "",
        expireDate: "",
        packagingDetails: "",
        images: [],
        variants: [],
        composition: "",
        productIntroduction: "",
        usesOfMedication: "",
        benefits: "",
        contradictions: "",
        isPrescriptionRequired: false,
        expertAdvice: "",
        substituteProducts: [],
        authorId: "",
        sub_category: "",
        direction_to_use: "",
        side_effects: "",
        precautions_while_using: "",
        descriptions: "",
        references: "",
        country_of_origin: "",
      });

      setDialogState((prev) => ({ ...prev, open: false }));
      await fetchProducts();
    } catch (error) {
      console.error("Error creating product:", error);
      setState((prev) => ({
        ...prev,
        snackbar: {
          open: true,
          message: error.message,
          severity: "error",
        },
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleCloseSnackbar = () => {
    setState((prev) => ({
      ...prev,
      snackbar: {
        ...prev.snackbar,
        open: false,
      },
    }));
  };

  const columns = [
    { Header: "Product Name", accessor: "productName" },
    { Header: "MRP", accessor: "mrp" },
    { Header: "Selling Price", accessor: "sellingPrice" },
    { Header: "Brand", accessor: "brand" },
    {
      Header: "Category",
      accessor: "category",
      Cell: CategoryCell,
    },
    { Header: "Expire Date", accessor: "expireDate" },
    {
      Header: "Prescription",
      accessor: "isPrescriptionRequired",
      Cell: PrescriptionCell,
    },
  ];

  const filteredProducts = state.products.filter((product) => {
    const search = state.searchTerm.toLowerCase();
    return (
      (product.productName || "").toLowerCase().includes(search) ||
      (product.brand || "").toLowerCase().includes(search) ||
      (product.category || "").toLowerCase().includes(search)
    );
  });

  if (state.loading && state.products.length === 0) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3} display="flex" justifyContent="center">
          <CircularProgress />
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="white"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <MDTypography variant="h6" color="black">
                    Products
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <FormControl sx={{ minWidth: 200 }} size="small">
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={state.selectedCategory}
                        label="Category"
                        onChange={(e) => {
                          setState((prev) => ({
                            ...prev,
                            selectedCategory: e.target.value,
                            currentPage: 1,
                          }));
                        }}
                      >
                        <MenuItem value="all">All Categories</MenuItem>
                        {state.categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="Search Products"
                      value={state.searchTerm}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          searchTerm: e.target.value,
                        }))
                      }
                      sx={{ width: 300 }}
                      size="small"
                    />
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => setDialogState((prev) => ({ ...prev, open: true }))}
                    >
                      Add New Product
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {filteredProducts.length > 0 ? (
                  <DataTable
                    table={{ columns, rows: filteredProducts }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm ? "No matching products found" : "No products available"}
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
              {state.totalPages > 1 && (
                <MDBox p={2} display="flex" justifyContent="center">
                  <Pagination
                    count={state.totalPages}
                    page={state.currentPage}
                    onChange={(_, page) => setState((prev) => ({ ...prev, currentPage: page }))}
                    color="primary"
                  />
                </MDBox>
              )}
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      <Dialog
        open={dialogState.open}
        onClose={() => setDialogState((prev) => ({ ...prev, open: false }))}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Product Name *"
                name="productName"
                value={newProduct.productName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Brand *"
                name="brand"
                value={newProduct.brand}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Category *</InputLabel>
                <Select
                  name="categoryId"
                  value={newProduct.categoryId}
                  onChange={handleInputChange}
                  label="Category *"
                >
                  {state.categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Sub Category"
                name="sub_category"
                value={newProduct.sub_category}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Author *</InputLabel>
                <Select
                  name="authorId"
                  value={newProduct.authorId}
                  onChange={handleInputChange}
                  label="Author *"
                >
                  {authors.map((author) => (
                    <MenuItem key={author.id} value={author.id}>
                      {author.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Manufacturer"
                name="manufacturer"
                value={newProduct.manufacturer}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Product Form"
                name="productForm"
                value={newProduct.productForm}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Consume Type"
                name="consumeType"
                value={newProduct.consumeType}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              {/* <TextField
                label="Sub Category"
                name="sub_category"
                value={newProduct.sub_category}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              /> */}
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="MRP *"
                name="mrp"
                type="number"
                value={newProduct.mrp}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Selling Price *"
                name="sellingPrice"
                type="number"
                value={newProduct.sellingPrice}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Expire Date"
                name="expireDate"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newProduct.expireDate}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Packaging Details"
                name="packagingDetails"
                value={newProduct.packagingDetails}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Age Group"
                name="age"
                value={newProduct.age}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Country of Origin"
                name="country_of_origin"
                value={newProduct.country_of_origin}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <FormControlLabel
                control={
                  <Switch
                    name="isPrescriptionRequired"
                    checked={newProduct.isPrescriptionRequired}
                    onChange={handleBooleanChange}
                  />
                }
                label="Prescription Required"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <input
                  type="file"
                  id="productImages"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                  accept="image/*"
                  multiple
                />
                <label htmlFor="productImages">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Upload Product Images"}
                  </Button>
                </label>
                {uploading && <CircularProgress size={24} />}
              </Box>
              <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                {newProduct.images.map((image, index) => (
                  <Chip
                    key={index}
                    label={image.split("/").pop()}
                    onDelete={() => handleRemoveImage(index)}
                    sx={{ maxWidth: 200 }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Variants (comma separated)"
                value={newProduct.variants.join(", ")}
                onChange={(e) => handleArrayChange(e, "variants")}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Substitute Products (comma separated)"
                value={newProduct.substituteProducts.join(", ")}
                onChange={(e) => handleArrayChange(e, "substituteProducts")}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Composition"
                name="composition"
                value={newProduct.composition}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
              <TextField
                label="Direction to Use"
                name="direction_to_use"
                value={newProduct.direction_to_use}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Uses"
                name="uses"
                value={newProduct.uses}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
              <TextField
                label="Benefits"
                name="benefits"
                value={newProduct.benefits}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
              <TextField
                label="Side Effects"
                name="side_effects"
                value={newProduct.side_effects}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
              <TextField
                label="Precautions While Using"
                name="precautions_while_using"
                value={newProduct.precautions_while_using}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Product Introduction"
                name="productIntroduction"
                value={newProduct.productIntroduction}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
              <TextField
                label="Uses of Medication"
                name="usesOfMedication"
                value={newProduct.usesOfMedication}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
              <TextField
                label="Contradictions"
                name="contradictions"
                value={newProduct.contradictions}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
              <TextField
                label="Expert Advice"
                name="expertAdvice"
                value={newProduct.expertAdvice}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
              <TextField
                label="Descriptions"
                name="descriptions"
                value={newProduct.descriptions}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
              <TextField
                label="References"
                name="references"
                value={newProduct.references}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, open: false }))}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateProduct}
            color="error"
            variant="contained"
            disabled={
              !newProduct.productName ||
              !newProduct.mrp ||
              !newProduct.sellingPrice ||
              !newProduct.brand ||
              !newProduct.categoryId ||
              !newProduct.authorId
            }
          >
            Create Product
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={state.snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={state.snackbar.severity}
          sx={{ width: "100%" }}
        >
          {state.snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

Products.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      productName: PropTypes.string.isRequired,
      mrp: PropTypes.number.isRequired,
      sellingPrice: PropTypes.number.isRequired,
      brand: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      expireDate: PropTypes.string,
      isPrescriptionRequired: PropTypes.bool,
    }).isRequired,
  }).isRequired,
};

export default Products;
