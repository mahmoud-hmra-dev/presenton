"use client";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Megaphone,
  Image as ImageIcon,
} from "lucide-react";
import React from "react";
import Link from "next/link";
import { RootState } from "@/store/store";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/store/slices/auth";
import { useRouter } from "next/navigation";

const UserAccount = () => {
  const canChangeKeys = useSelector(
    (state: RootState) => state.userConfig.can_change_keys,
  );
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/dashboard"
        prefetch={false}
        className="flex items-center gap-2 px-3 py-2 text-white hover:bg-primary/80 rounded-md transition-colors outline-none"
        role="menuitem"
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-sm font-medium font-inter">Dashboard</span>
      </Link>
      <Link
        href="/social"
        prefetch={false}
        className="flex items-center gap-2 px-3 py-2 text-white hover:bg-primary/80 rounded-md transition-colors outline-none"
        role="menuitem"
      >
        <Megaphone className="w-5 h-5" />
        <span className="text-sm font-medium font-inter">Social</span>
      </Link>
      <Link
        href="/flyer"
        prefetch={false}
        className="flex items-center gap-2 px-3 py-2 text-white hover:bg-primary/80 rounded-md transition-colors outline-none"
        role="menuitem"
      >
        <ImageIcon className="w-5 h-5" />
        <span className="text-sm font-medium font-inter">Flyer</span>
      </Link>
      {user === "admin@clingroup.net" && (
        <Link
          href="/admin"
          prefetch={false}
          className="flex items-center gap-2 px-3 py-2 text-white hover:bg-primary/80 rounded-md transition-colors outline-none"
          role="menuitem"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-sm font-medium font-inter">Admin</span>
        </Link>
      )}
      {canChangeKeys && (
        <Link
          href="/settings"
          prefetch={false}
          className="flex items-center gap-2 px-3 py-2 text-white hover:bg-primary/80 rounded-md transition-colors outline-none"
          role="menuitem"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium font-inter">Settings</span>
        </Link>
      )}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-2 text-white hover:bg-primary/80 rounded-md transition-colors outline-none"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-sm font-medium font-inter">Logout</span>
      </button>
    </div>
  );
};

export default UserAccount;
