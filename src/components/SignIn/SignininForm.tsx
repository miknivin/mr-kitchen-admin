import { useState } from "react";
import Swal from "sweetalert2";
import SigninWithGoogle from "./signinWithGoogle";
import { useLoginMutation } from "@/redux/api/authApi";

export default function SignininForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const result = await login({ email, password }).unwrap();

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        timer: 2000,
        showConfirmButton: false,
      });

      console.log("Login successful:", result);
      // Handle successful login (e.g., redirect or update UI)
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err?.data?.message || "Invalid email or password",
      });

      console.error("Login failed:", err);
    }
  };

  return (
    <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
      <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
        Sign In to Mrkitchen Admin
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="mb-2.5 block font-medium text-black dark:text-white">
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-2.5 block font-medium text-black dark:text-white">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              placeholder="6+ Characters, 1 Capital letter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>

        <div className="mb-5">
          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </div>

        {/* <SigninWithGoogle /> */}
      </form>
    </div>
  );
}
