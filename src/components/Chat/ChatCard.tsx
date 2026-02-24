import Link from "next/link";
import Image from "next/image";
import { User } from "@/types/user";
import { useGetAdminUsersQuery } from "@/redux/api/userApi";
import Spinner from "../common/Spinner";

const ChatCard = () => {
  const { data, error, isLoading } = useGetAdminUsersQuery(null);

  if (isLoading) return <Spinner />;
  if (error) return <p>Error getting users</p>;

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div className="my-3 flex items-center justify-between">
        <h4 className="px-7.5 text-xl font-semibold text-black dark:text-white">
          Latest Users
        </h4>
        <div>
          <Link href={"/users"} className="btn-soft btn me-3">
            View users
          </Link>
        </div>
      </div>

      <div>
        {data?.users.slice(0, 5)?.map((user: User) => (
          <div
            className="flex items-center gap-5 px-7.5 py-3 hover:bg-gray-3 dark:hover:bg-meta-4"
            key={user._id}
          >
            <div className="relative h-14 w-14 rounded-full">
              <Image
                width={56}
                className="mask mask-squircle bg-slate-100"
                height={56}
                src={user?.avatar?.url || "/default-avatar.png"} // Use default image if avatar is missing
                alt="User"
                style={{
                  width: "auto",
                  height: "auto",
                }}
              />
              {/* <span
                className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                  user.isOnline ? "bg-meta-6" : "bg-meta-5"
                }`} 
              ></span> */}
            </div>

            <div className="flex flex-1 items-center justify-between">
              <div>
                <h5 className="font-medium text-black dark:text-white">
                  {user.name}
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email || user.phone}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatCard;
