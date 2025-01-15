"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";

export default function AdminClientsPage() {
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase.from("clients").select("*");
      if (error) {
        toast.error("Erreur lors du chargement des clients.");
      } else {
        setClients(data);
      }
    };

    fetchClients();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des Clients</h1>
      <div>
        {clients.map((client) => (
          <div key={client.id} className="border-b py-4">
            <h2 className="text-xl font-semibold">{client.name}</h2>
            <p>{client.email}</p>
            <p>{client.phone}</p>
            <p>{client.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
