"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { login } from "@/store/slices/auth";

const LoginForm = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (username && password) {
      dispatch(login({ user: username }));
      router.push("/");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-w-sm mx-auto mt-10 gap-4">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border rounded p-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border rounded p-2"
      />
      <button type="submit" className="bg-blue-500 text-white rounded p-2">
        Login
      </button>
    </form>
  );
};

export default LoginForm;
