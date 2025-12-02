'use client'

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trash2, RotateCcw, Stethoscope, History, Home } from 'lucide-react';

// Simulasi Supabase data (dalam produksi, ini dari database)
const RULES_DATA = [
  {
    id: 1,
    nama_rule: "Komputer tidak menyala",
    gejala: ["Indikator Power mati", "Kipas diam", "LED pada motherboard mati"],
    solusi: "Periksa PSU dan kabel power. Cek koneksi tombol power ke motherboard.",
    cf_rule: 0.8
  },
  {
    id: 2,
    nama_rule: "RAM rusak",
    gejala: ["Bunyi beep 3 kali", "Layar black screen/blank", "Komputer restart sendiri"],
    solusi: "Lepas dan bersihkan RAM, lalu pasang kembali. Coba slot RAM berbeda.",
    cf_rule: 0.9
  },
  {
    id: 3,
    nama_rule: "Hard disk bermasalah",
    gejala: ["Bunyi klik", "Booting lambat", "Blue screen"],
    solusi: "Backup data segera. Periksa kabel SATA dan ganti hard disk jika perlu.",
    cf_rule: 0.85
  },
  {
    id: 4,
    nama_rule: "Overheat processor",
    gejala: ["Komputer restart sendiri", "Kipas bising", "Performa lambat"],
    solusi: "Bersihkan heatsink dan ganti thermal paste. Periksa sistem pendingin.",
    cf_rule: 0.75
  },
  {
    id: 5,
    nama_rule: "VGA Card rusak",
    gejala: ["Layar black screen/blank", "Muncul artefak pada layar", "Blue screen"],
    solusi: "Bersihkan slot VGA. Coba VGA di komputer lain atau ganti VGA.",
    cf_rule: 0.82
  },
  {
    id: 6,
    nama_rule: "Motherboard bermasalah",
    gejala: ["Bunyi beep 3 kali", "Slot RAM tidak berfungsi", "Komputer restart sendiri"],
    solusi: "Periksa kapasitor yang menggembung. Mungkin perlu ganti motherboard.",
    cf_rule: 0.7
  }
];

// Fungsi CF Combine
const cfCombine = (cf1:number, cf2:number):number => {
  return cf1 + cf2 * (1 - cf1);
};

// Fungsi menghitung CF untuk diagnosa
const calculateDiagnosis = (selectedSymptoms) => {
  const results = [];
  
  RULES_DATA.forEach(rule => {
    const matchingSymptoms = rule.gejala.filter(g => 
      selectedSymptoms.includes(g)
    );
    
    if (matchingSymptoms.length > 0) {
      // CF User diasumsikan 0.8 untuk setiap gejala yang dipilih
      const cfUser = 0.8;
      
      // Hitung CF kombinasi untuk semua gejala yang cocok
      let cfCombined = rule.cf_rule * cfUser;
      
      for (let i = 1; i < matchingSymptoms.length; i++) {
        cfCombined = cfCombine(cfCombined, rule.cf_rule * cfUser);
      }
      
      results.push({
        id: rule.id,
        nama_rule: rule.nama_rule,
        solusi: rule.solusi,
        cf_percentage: Math.round(cfCombined * 100),
        matching_symptoms: matchingSymptoms.length,
        total_symptoms: rule.gejala.length
      });
    }
  });
  
  // Sort by CF percentage (descending)
  return results.sort((a, b) => b.cf_percentage - a.cf_percentage);
};

// Ambil semua gejala unik dari rules
const getAllSymptoms = () => {
  const symptoms = new Set();
  RULES_DATA.forEach(rule => {
    rule.gejala.forEach(g => symptoms.add(g));
  });
  return Array.from(symptoms).sort();
};

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [allSymptoms] = useState(getAllSymptoms());

  // Load history dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem('diagnosis_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleSymptomToggle = (symptom) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleDiagnose = () => {
    if (selectedSymptoms.length === 0) {
      alert('Pilih minimal 1 gejala untuk diagnosa');
      return;
    }

    const results = calculateDiagnosis(selectedSymptoms);
    const diagnosis = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      symptoms: [...selectedSymptoms],
      results
    };

    setDiagnosisResult(diagnosis);

    // Simpan ke history
    const newHistory = [diagnosis, ...history].slice(0, 10); // Max 10 history
    setHistory(newHistory);
    localStorage.setItem('diagnosis_history', JSON.stringify(newHistory));
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setDiagnosisResult(null);
  };

  const handleClearHistory = () => {
    if (confirm('Yakin ingin menghapus semua riwayat diagnosa?')) {
      setHistory([]);
      localStorage.removeItem('diagnosis_history');
    }
  };

  const renderHome = () => (
    <div className="space-y-6 text-gray-900">
      <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Sistem Pakar Diagnosa Komputer</h1>
        <p className="text-blue-100">Pilih gejala yang dialami komputer Anda untuk mendapatkan solusi</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Stethoscope className="w-6 h-6" />
          Pilih Gejala
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allSymptoms.map(symptom => (
            <label
              key={symptom}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-blue-50 cursor-pointer transition"
            >
              <input
                type="checkbox"
                checked={selectedSymptoms.includes(symptom)}
                onChange={() => handleSymptomToggle(symptom)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-gray-700">{symptom}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleDiagnose}
            disabled={selectedSymptoms.length === 0}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            Diagnosa Sekarang
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
        </div>
      </div>

      {diagnosisResult && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Hasil Diagnosa</h2>
          
          {diagnosisResult.results.length > 0 ? (
            <>
              <div className="mb-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={diagnosisResult.results}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="nama_rule" 
                      angle={-45} 
                      textAnchor="end" 
                      height={120}
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis label={{ value: 'Persentase (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cf_percentage" fill="#3b82f6" name="Certainty Factor (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                {diagnosisResult.results.map((result, index) => (
                  <div 
                    key={result.id}
                    className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">
                        #{index + 1} {result.nama_rule}
                      </h3>
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {result.cf_percentage}%
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      <strong>Gejala cocok:</strong> {result.matching_symptoms} dari {result.total_symptoms}
                    </p>
                    <p className="text-gray-800">
                      <strong>Solusi:</strong> {result.solusi}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-600 text-center py-8">
              Tidak ditemukan kerusakan yang sesuai dengan gejala yang dipilih.
            </p>
          )}
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6 text-gray-900">
      <div className="bg-linear-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Riwayat Diagnosa</h1>
        <p className="text-purple-100">Lihat kembali hasil diagnosa sebelumnya</p>
      </div>

      {history.length > 0 ? (
        <>
          <div className="flex justify-end">
            <button
              onClick={handleClearHistory}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Hapus Semua Riwayat
            </button>
          </div>

          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      {new Date(item.timestamp).toLocaleString('id-ID')}
                    </p>
                    <p className="text-gray-700 mt-1">
                      <strong>Gejala:</strong> {item.symptoms.join(', ')}
                    </p>
                  </div>
                </div>

                {item.results.length > 0 ? (
                  <div className="space-y-3">
                    {item.results.map((result, index) => (
                      <div 
                        key={result.id}
                        className="border-l-4 border-purple-500 bg-purple-50 p-3 rounded-r-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">
                              #{index + 1} {result.nama_rule}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">{result.solusi}</p>
                          </div>
                          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold ml-2">
                            {result.cf_percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Tidak ada hasil diagnosa</p>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Belum ada riwayat diagnosa</p>
          <button
            onClick={() => setCurrentPage('home')}
            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Mulai Diagnosa
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentPage('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                currentPage === 'home'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home className="w-5 h-5" />
              Diagnosa
            </button>
            <button
              onClick={() => setCurrentPage('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                currentPage === 'history'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <History className="w-5 h-5" />
              Riwayat
              {history.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {currentPage === 'home' ? renderHome() : renderHistory()}
      </main>

      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-600">
          <p>Sistem Pakar Diagnosa Komputer - Menggunakan Metode Certainty Factor</p>
        </div>
      </footer>
    </div>
  );
}

export default App;