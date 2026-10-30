"use client";

import { EmployeeCard } from "@/app/components/admin/EmployeeCard";
import { fetchClients } from "@/services/userServices";
import { UserProfile } from "@/types/user";
import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function EmployeePage() {
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadEmployees = async () => {
    try {
      const data = await fetchClients();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error) {
      console.error("Failed to load employees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // Filter clients based on search input
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = employees.filter(
        (emp) =>
          emp.fullname?.toLowerCase().includes(query) ||
          emp.position?.toLowerCase().includes(query) ||
          emp.office?.toLowerCase().includes(query) ||
          emp.code?.toLowerCase().includes(query),
      );
      setFilteredEmployees(filtered);
    }
  }, [searchQuery, employees]);

  return (
    <div className="space-y-6">
      {/* 1. Header (matches EventIndex) */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Employees Management
        </h1>
        <p className="text-sm text-muted-foreground">
          View list of registered employee accounts and profiles
        </p>
      </div>

      {/* 2. Search Bar (matches EventIndex) */}
      <div className="flex items-center w-full xl:max-w-sm bg-card border border-border px-4 py-2.5 rounded-md text-foreground shadow-none">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, position, office, or code..."
          className="flex-1 ml-3 bg-transparent text-sm text-foreground font-medium outline-none placeholder:text-muted-foreground/70"
        />
      </div>

      {/* 3. Content Area */}
      {loading ? (
        <div className="p-12 bg-card border border-border rounded-md flex items-center justify-center shadow-none">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="p-12 bg-card border border-border border-dashed rounded-md flex items-center justify-center text-center shadow-none">
          <p className="text-sm font-medium text-muted-foreground">
            No employees found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredEmployees.map((item) => (
            <EmployeeCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
