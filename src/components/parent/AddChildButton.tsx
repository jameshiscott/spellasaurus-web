"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const schema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^\S+$/, "Username must not contain spaces"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  classId: z.string().optional(),
});

type AddChildFormValues = z.infer<typeof schema>;

interface SchoolOption {
  id: string;
  name: string;
  address: string | null;
}

interface ClassOption {
  id: string;
  name: string;
  school_year: string;
}

export function AddChildButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<SchoolOption | null>(null);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const schoolInputRef = useRef<HTMLInputElement>(null);
  const schoolDropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddChildFormValues>({ resolver: zodResolver(schema) });

  // Fetch schools from API with search query
  const fetchSchools = useCallback(async (query: string) => {
    setSchoolsLoading(true);
    try {
      const res = await fetch(`/api/schools/list?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const body = (await res.json()) as { schools: SchoolOption[] };
        setSchools(body.schools);
      }
    } catch {
      // silently fail
    } finally {
      setSchoolsLoading(false);
    }
  }, []);

  // Fetch schools when modal opens
  useEffect(() => {
    if (!open) return;
    fetchSchools("");
  }, [open, fetchSchools]);

  // Debounced search
  useEffect(() => {
    if (!schoolDropdownOpen) return;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchSchools(schoolSearch);
    }, 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [schoolSearch, schoolDropdownOpen, fetchSchools]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(e.target as Node)) {
        setSchoolDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch classes when school is selected
  useEffect(() => {
    if (!selectedSchool) {
      setClasses([]);
      setValue("classId", undefined);
      return;
    }
    fetch(`/api/schools/classes?schoolId=${encodeURIComponent(selectedSchool.id)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((body: { classes: ClassOption[] }) => {
        setClasses(body.classes);
      })
      .catch(() => {
        setClasses([]);
      });
  }, [selectedSchool, setValue]);

  const handleClose = () => {
    setOpen(false);
    reset();
    setError(null);
    setSuccess(false);
    setShowPassword(false);
    setSelectedSchool(null);
    setSchoolSearch("");
    setSchoolDropdownOpen(false);
    setClasses([]);
  };

  const onSubmit = async (data: AddChildFormValues) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/create-child", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          classId: data.classId || undefined,
        }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        if (res.status === 409) {
          setError("Username already taken — please choose another");
        } else {
          setError(body.error ?? "Failed to create child account");
        }
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        handleClose();
        router.refresh();
      }, 1500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-2xl bg-[#6C5CE7] text-white font-bold px-5 py-2.5 text-sm hover:bg-[#5a4bd1] transition-colors shrink-0"
      >
        Add Child +
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-black mb-1">Add a Child</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Create a new account your child can log in with.
            </p>

            {success ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">🎉</p>
                <p className="font-bold text-[#00B894] text-lg">
                  Child account created!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Full name */}
                <div className="space-y-1">
                  <label htmlFor="fullName" className="block text-sm font-semibold">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Alex Smith"
                    className="w-full rounded-xl border-2 border-border px-4 py-2 font-semibold focus:border-[#6C5CE7] focus:outline-none"
                    {...register("fullName")}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-[#D63031]">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <label htmlFor="username" className="block text-sm font-semibold">
                    Username
                  </label>
                  <div className="flex items-center rounded-xl border-2 border-border focus-within:border-[#6C5CE7] overflow-hidden">
                    <input
                      id="username"
                      type="text"
                      placeholder="alexsmith"
                      className="flex-1 px-4 py-2 font-semibold focus:outline-none"
                      {...register("username")}
                    />
                    <span className="pr-4 text-sm text-muted-foreground font-semibold">
                      @spellasaurus.internal
                    </span>
                  </div>
                  {errors.username && (
                    <p className="text-xs text-[#D63031]">{errors.username.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label htmlFor="password" className="block text-sm font-semibold">
                    Password
                  </label>
                  <div className="flex items-center rounded-xl border-2 border-border focus-within:border-[#6C5CE7] overflow-hidden">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 8 characters"
                      className="flex-1 px-4 py-2 font-semibold focus:outline-none"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="pr-4 text-sm text-muted-foreground font-semibold hover:text-foreground"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-[#D63031]">{errors.password.message}</p>
                  )}
                </div>

                {/* Date of birth */}
                <div className="space-y-1">
                  <label htmlFor="dateOfBirth" className="block text-sm font-semibold">
                    Date of Birth
                  </label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    className="w-full rounded-xl border-2 border-border px-4 py-2 font-semibold focus:border-[#6C5CE7] focus:outline-none"
                    {...register("dateOfBirth")}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-xs text-[#D63031]">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                {/* School & Class (optional) */}
                <div className="rounded-xl border-2 border-dashed border-border p-4 space-y-3">
                  <p className="text-sm font-semibold text-foreground">
                    School &amp; Class
                    <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    If your child&apos;s school uses Spellasaurus, select it here to join their class.
                  </p>

                  <div className="space-y-1 relative" ref={schoolDropdownRef}>
                    <label htmlFor="school" className="block text-xs font-semibold text-muted-foreground">
                      School
                    </label>
                    <div className="relative">
                      <input
                        ref={schoolInputRef}
                        id="school"
                        type="text"
                        autoComplete="off"
                        placeholder="Search for a school..."
                        value={selectedSchool && !schoolDropdownOpen ? selectedSchool.name : schoolSearch}
                        onChange={(e) => {
                          setSchoolSearch(e.target.value);
                          if (!schoolDropdownOpen) setSchoolDropdownOpen(true);
                          if (selectedSchool) {
                            setSelectedSchool(null);
                            setValue("classId", undefined);
                          }
                        }}
                        onFocus={() => {
                          setSchoolDropdownOpen(true);
                          if (selectedSchool) {
                            setSchoolSearch(selectedSchool.name);
                          }
                        }}
                        className="w-full rounded-xl border-2 border-border px-4 py-2 font-semibold focus:border-[#6C5CE7] focus:outline-none text-sm"
                      />
                      {selectedSchool && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSchool(null);
                            setSchoolSearch("");
                            setValue("classId", undefined);
                            schoolInputRef.current?.focus();
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    {schoolDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border-2 border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {schoolsLoading ? (
                          <div className="px-4 py-3 text-sm text-muted-foreground">Searching...</div>
                        ) : schools.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-muted-foreground">
                            {schoolSearch.length > 0 ? "No schools found" : "No schools available"}
                          </div>
                        ) : (
                          schools.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setSelectedSchool(s);
                                setSchoolSearch("");
                                setSchoolDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-[#F8F6FF] transition-colors text-sm"
                            >
                              <span className="font-semibold text-foreground block">{s.name}</span>
                              {s.address && (
                                <span className="text-xs text-muted-foreground block mt-0.5">{s.address}</span>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {selectedSchool && classes.length > 0 && (
                    <div className="space-y-1">
                      <label htmlFor="classSelect" className="block text-xs font-semibold text-muted-foreground">
                        Class
                      </label>
                      <select
                        id="classSelect"
                        {...register("classId")}
                        className="w-full rounded-xl border-2 border-border px-4 py-2 font-semibold focus:border-[#6C5CE7] focus:outline-none text-sm"
                      >
                        <option value="">No class</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} (Year {c.school_year})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedSchool && classes.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      No classes found for this school.
                    </p>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-[#D63031] bg-red-50 rounded-xl px-4 py-2">
                    {error}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 rounded-2xl border-2 border-border font-bold py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-2xl bg-[#6C5CE7] text-white font-bold py-2 text-sm hover:bg-[#5a4bd1] disabled:opacity-60 transition-colors"
                  >
                    {loading ? "Creating…" : "Create Account"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
