/* eslint-disable @next/next/no-img-element */
import { OrderItem } from "@/types/sessionStartedOrder";
import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Download from "../SvgIcons/Download";
// Replace with your actual Download icon component

interface ProductItemProps {
  product: OrderItem;
}

const ProductItem: React.FC<ProductItemProps> = ({ product }) => {
  const { name, quantity, image, price, uploadedImage, variant } = product;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="mt-4 flex w-full flex-col items-start justify-start md:mt-6 md:flex-row md:items-center md:space-x-6 xl:space-x-8">
      <div className="w-full pb-4 md:w-40 md:pb-8">
        <img className="hidden w-full md:block" src={image} alt={name} />
      </div>
      <div className="flex w-full flex-col items-start justify-between space-y-4 border-b border-gray-200 pb-8 dark:border-gray-700 md:flex-row md:space-y-0">
        <div className="flex w-full flex-col items-start justify-start space-y-3">
          <h3 className="line-clamp-3 text-ellipsis whitespace-break-spaces text-xl font-semibold leading-6  text-gray-800 dark:text-gray-100 xl:text-2xl">
            {name}
          </h3>
          <h3 className="line-clamp-3 text-ellipsis whitespace-break-spaces text-sm font-normal leading-6  text-gray-800 dark:text-gray-100 xl:text-xl">
            {typeof variant === "object" && variant?.size
              ? variant.size
              : variant || ""}
          </h3>

          <div className="dropdown relative mt-1" ref={dropdownRef}>
            <div
              role="button"
              tabIndex={0}
              className="btn"
              onClick={toggleDropdown}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  toggleDropdown();
                }
              }}
            >
              Uploaded image
            </div>

            {isOpen && (
              <div
                className="dropdown-content absolute z-[10] mt-2 w-56 rounded-box bg-base-100 p-2 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {uploadedImage && uploadedImage.length > 0 ? (
                  <div>
                    <Swiper
                      modules={[Navigation, Pagination]}
                      spaceBetween={10}
                      slidesPerView={1}
                      navigation
                      pagination={{ clickable: true }}
                      className="my-4"
                    >
                      {uploadedImage.map((image: string, index: number) => (
                        <SwiperSlide key={index}>
                          <div className="relative">
                            <img
                              src={image}
                              alt={`Slide ${index}`}
                              className="h-36 w-36 object-contain"
                            />
                            <a
                              href={image}
                              download={`image-${index}`}
                              className="absolute right-2 top-2 rounded-full bg-white p-1 shadow-md hover:bg-gray-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Download />
                            </a>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                ) : (
                  <p className="p-2 text-gray-500">No uploaded images</p>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex w-full items-start justify-between space-x-8">
          <div className="flex flex-col">
            <p className="text-base font-bold leading-6 text-[#802367] xl:text-lg">
              ₹
              {product.discountPrice && Number(product.discountPrice) > 0
                ? product.discountPrice
                : price}
            </p>
            {product.discountPrice && Number(product.discountPrice) > 0 && (
              <p className="text-sm leading-6 text-gray-400 line-through">
                ₹{price}
              </p>
            )}
          </div>
          <p className="text-base leading-6 text-gray-800 dark:text-gray-100 xl:text-lg">
            {quantity}
          </p>
          <p className="text-base font-semibold leading-6 text-gray-800 dark:text-gray-100 xl:text-lg">
            ₹
            {(product.discountPrice && Number(product.discountPrice) > 0
              ? Number(product.discountPrice)
              : Number(price)) * quantity}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;