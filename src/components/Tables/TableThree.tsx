"use client";
import {
  useDeleteProductMutation,
  useGetProductsQuery,
} from "@/redux/api/productsApi";
import Spinner from "@/components/common/Spinner/index";
import UploadIcon from "../SvgIcons/UploadIcon";
import { useState } from "react";
import ReusableModal from "../Modals/ReusableModal";
import SimpleFileInput from "@/components/FormElements/fileInput/SimpleFileInput";
import ImagesIcon from "../SvgIcons/ImagesIcon";
import ProductImagesUpload from "../FormElements/fileInput/ProductImagesUpload";
import Link from "next/link";
import PreviewIcon from "../SvgIcons/PreviewIcon";
import PaginationComponent from "@/utlis/pagination/PaginationComponent";
import DeleteIcon from "../SvgIcons/DeleteIcon";
import ReusableAlert from "@/utlis/alerts/ReusableAlert";
import toast from "react-hot-toast";
import SearchAndCategoryFilter from "../FormElements/fileInput/SearchAndCategoryFilter";
import { Product } from "@/interfaces/product";

const TableThree = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All categories");

  const { data, isLoading, isFetching, isError } = useGetProductsQuery({
    page: currentPage,
    limit: itemsPerPage,
    keyword: searchTerm.trim(),
    category: selectedCategory === "All categories" ? "" : selectedCategory,
  });

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const openUploadModal = () => setIsUploadModalOpen(true);
  const closeUploadModal = () => setIsUploadModalOpen(false);

  const openImagesModal = (product: Product) => {
    setCurrentProduct(product);
    setIsImagesModalOpen(true);
  };

  const closeImagesModal = () => {
    setCurrentProduct(null);
    setIsImagesModalOpen(false);
  };

  const openDeleteModal = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setCurrentProduct(null);
    setIsDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    if (!currentProduct) return;
    try {
      await deleteProduct(currentProduct._id).unwrap();
      toast.success("Product deleted successfully");
      closeDeleteModal();
    } catch (error) {
      toast.error("Error Deleting Product");
      console.error("Failed to delete product:", error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleSearch = (newSearchTerm: string, newCategory: string) => {
    setSearchTerm(newSearchTerm.trim());
    setSelectedCategory(newCategory);
    setCurrentPage(1);
  };

  const updateProduct = (data: Partial<Product>) => {
    if (currentProduct) {
      setCurrentProduct({ ...currentProduct, ...data });
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <h1 className="text-xl font-semibold text-black dark:text-white">
          Total Products: {data?.totalProducts || 0}
        </h1>
        <SearchAndCategoryFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onSearch={handleSearch}
        />
      </div>
      {isFetching && <Spinner />}
      <div className="max-w-full overflow-x-auto">
        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Failed to load products.
          </p>
        ) : (
          <>
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                    Product
                  </th>
                  <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                    Variants
                  </th>

                  <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                    Created at
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.allProducts?.length ? (
                  data.allProducts.map((product: Product, key: number) => (
                    <tr key={key}>
                      <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                        <h5 className="font-medium text-black dark:text-white">
                          {product.name}
                        </h5>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <div className="flex max-w-[300px] flex-wrap gap-3">
                          {product.variants.map((variant, index) => (
                            <div
                              key={index}
                              className="shadow-xs inline-flex rounded-md"
                              role="group"
                            >
                              <button
                                type="button"
                                className="flex flex-col rounded-s-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white dark:focus:text-white dark:focus:ring-blue-500"
                              >
                                <p className="text-xs font-thin">Size</p>
                                {variant.size}
                              </button>
                              <button
                                type="button"
                                className="flex flex-col rounded-e-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white dark:focus:text-white dark:focus:ring-blue-500"
                              >
                                <p className="text-xs font-thin">Price</p>
                                {variant.discountPrice || variant.price}
                              </button>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {new Date(product.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "2-digit",
                            },
                          )}
                        </p>
                      </td>
                      <td className="flex flex-wrap gap-3 border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <button
                          onClick={() => openImagesModal(product)}
                          className="btn border-none bg-primary p-3 text-gray-200 hover:bg-primary/80"
                        >
                          <ImagesIcon />
                        </button>
                        <Link
                          href={`products/update-product/${product._id}`}
                          className="btn border-none bg-primary p-3 text-gray-200 hover:bg-primary/80"
                        >
                          <PreviewIcon />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(product)}
                          className="btn !border-none bg-red-600 p-3 text-gray-200 hover:bg-red-600/80"
                        >
                          {isDeleting ? <Spinner /> : <DeleteIcon />}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="border-b border-[#eee] px-4 py-5 text-center text-gray-500 dark:border-strokedark dark:text-gray-400"
                    >
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </div>

      {data?.allProducts?.length > 0 && (
        <>
          <PaginationComponent
            currentPage={currentPage}
            totalPages={Math.ceil((data?.totalProducts || 0) / itemsPerPage)}
            onPageChange={handlePageChange}
          />

          <div className="mt-4 flex justify-end">
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="select rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </>
      )}

      {/* Modals */}
      {isUploadModalOpen && (
        <ReusableModal
          onClose={closeUploadModal}
          formContent={<SimpleFileInput />}
          title={"Add Choice Images"}
        />
      )}
      {isImagesModalOpen && currentProduct && (
        <ReusableModal
          onClose={closeImagesModal}
          formContent={
            <ProductImagesUpload
              product={currentProduct}
              updateProduct={updateProduct}
              onClose={closeImagesModal}
            />
          }
          title={"Product images"}
        />
      )}
      {isDeleteModalOpen && currentProduct && (
        <ReusableAlert
          title="Confirm Deletion"
          content={`Are you sure you want to delete "${currentProduct.name}"?`}
          func={handleDelete}
          isOpen={isDeleteModalOpen}
          functionTitle={"Delete"}
          buttonStyle={"bg-red-600"}
          onClose={closeDeleteModal}
        />
      )}
    </div>
  );
};

export default TableThree;
