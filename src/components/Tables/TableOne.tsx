import { BRAND } from "@/types/brand";
import Image from "next/image";

const brandData: BRAND[] = [
  {
    logo: "/images/brand/brand-01.svg",
    name: "Google",
    visitors: 3.5,
    revenues: "5,768",
    sales: 590,
    conversion: 4.8,
  },
  {
    logo: "/images/brand/brand-02.svg",
    name: "Twitter",
    visitors: 2.2,
    revenues: "4,635",
    sales: 467,
    conversion: 4.3,
  },
  {
    logo: "/images/brand/brand-03.svg",
    name: "Github",
    visitors: 2.1,
    revenues: "4,290",
    sales: 420,
    conversion: 3.7,
  },
  {
    logo: "/images/brand/brand-04.svg",
    name: "Vimeo",
    visitors: 1.5,
    revenues: "3,580",
    sales: 389,
    conversion: 2.5,
  },
  {
    logo: "/images/brand/brand-05.svg",
    name: "Facebook",
    visitors: 3.5,
    revenues: "6,768",
    sales: 390,
    conversion: 4.2,
  },
];

const TableOne = () => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Latest Orders
      </h4>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Source
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Visitors
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Revenues
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Sales
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Conversion
              </th>
            </tr>
          </thead>
          <tbody>
            {brandData.map((brand, key) => (
              <tr
                key={key}
                className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 ${
                  key === brandData.length - 1 ? "" : "border-b border-stroke dark:border-strokedark"
                }`}
              >
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Image src={brand.logo} alt="Brand" width={48} height={48} />
                    </div>
                    <p className=" text-black dark:text-white sm:block">
                      {brand.name}
                    </p>
                  </div>
                </th>
                <td className="px-6 py-4 text-center">
                  <p className="text-black dark:text-white">{brand.visitors}K</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-meta-3">${brand.revenues}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-black dark:text-white">{brand.sales}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-meta-5">{brand.conversion}%</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableOne;
