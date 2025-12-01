'use client';

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

// Type untuk data gejala
type Symptom = {
  id: string;
  label: string;
};

// Props untuk komponen
type SymptomFormProps = {
  symptoms: Symptom[];
  onSubmit: (data: any) => Promise<void>;
};

// Schema validasi
const schema = z.object({
  symptoms: z.array(z.string()).min(1, "Pilih minimal 1 gejala"),
});

export default function SymptomForm({ symptoms = [], onSubmit }: SymptomFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const submitHandler = async (data: any) => {
    setLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <div className="space-y-2">
        <label className="font-semibold">Pilih Gejala:</label>

        {symptoms.map((s) => (
          <div key={s.id} className="flex gap-2 items-center">
            <input
              type="checkbox"
              value={s.id}
              {...register("symptoms")}
            />
            <span>{s.label}</span>
          </div>
        ))}

        {errors.symptoms && (
          <p className="text-red-600 text-sm">{errors.symptoms.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Memproses..." : "Submit"}
      </button>
    </form>
  );
}