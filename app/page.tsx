'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import { 
  Trash2, RotateCcw, Stethoscope, History, Home, 
  Moon, Sun 
} from 'lucide-react';

/* =======================================================
   TYPE DEFINITIONS
   ======================================================= */

type Symptom = string;

type ResultItem = {
  id: number;
  nama_rule: string;
  solusi: string;
  cf_percentage: number;
  matching_symptoms: number;
  total_symptoms: number;
};

type Diagnosis = {
  id: number;
  timestamp: string;
  symptoms: Symptom[];
  results: ResultItem[];
};


/* =======================================================
   RULES (Simulasi database)
   ======================================================= */
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


/* =======================================================
   CF COMBINE
   ======================================================= */
const cfCombine = (cf1: number, cf2: number): number => {
  return cf1 + cf2 * (1 - cf1);
};


/* =======================================================
   FUNCTION: HITUNG DIAGNOSIS
   ======================================================= */
const calculateDiagnosis = (selectedSymptoms: Symptom[]): ResultItem[] => {
  const results: ResultItem[] = [];

  RULES_DATA.forEach(rule => {
    const matchingSymptoms = rule.gejala.filter(g =>
      selectedSymptoms.includes(g)
    );

    if (matchingSymptoms.length > 0) {
      const cfUser = 0.8;

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

  return results.sort((a, b) => b.cf_percentage - a.cf_percentage);
};


/* =======================================================
   GET ALL SYMPTOMS
   ======================================================= */
const getAllSymptoms = (): Symptom[] => {
  const symptoms = new Set<string>();
  RULES_DATA.forEach(rule => rule.gejala.forEach(g => symptoms.add(g)));
  return Array.from(symptoms).sort();
};


/* =======================================================
   MAIN COMPONENT
   ======================================================= */
export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'history'>('home');
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [diagnosisResult, setDiagnosisResult] = useState<Diagnosis | null>(null);
  const [history, setHistory] = useState<Diagnosis[]>([]);
  const [allSymptoms] = useState<Symptom[]>(getAllSymptoms());

  // STATE DARK MODE
  const [isDarkMode, setIsDarkMode] = useState(false);

  /* =======================================================
     LOAD HISTORY & THEME LS
     ======================================================= */
  useEffect(() => {
    // Load History
    const savedHistory = localStorage.getItem('diagnosis_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    // Load Theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    } else if (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Auto detect system preference
      setIsDarkMode(true);
    }
  }, []);


  /* =======================================================
     HANDLE TOGGLE THEME
     ======================================================= */
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };


  /* =======================================================
     HANDLE TOGGLE SYMPTOM
     ======================================================= */
  const handleSymptomToggle = (symptom: Symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
    setSelectedSymtoms(symptom)
    setDetails(true)
  };


  /* =======================================================
     HANDLE DIAGNOSIS
     ======================================================= */
  const handleDiagnose = () => {
    if (symptoms.length === 0) {
      alert('Pilih minimal 1 gejala untuk diagnosa');
      return;
    }

    const results = calculateDiagnosis(selectedSymptoms);

    const diagnosis: Diagnosis = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      symptoms: [...symptoms],
      results
    };

    setDiagnosisResult(diagnosis);

    const newHistory = [diagnosis, ...history].slice(0, 10);
    setHistory(newHistory);

    localStorage.setItem('diagnosis_history', JSON.stringify(newHistory));
  };


  /* =======================================================
     RESET FORM
     ======================================================= */
  const handleReset = () => {
    setSymptoms([]);
    setDiagnosisResult(null);
    if (details == true) {
      setDetails(false)
    }
  };


  /* =======================================================
     CLEAR HISTORY
     ======================================================= */
  const handleClearHistory = () => {
    if (confirm('Yakin ingin menghapus semua riwayat diagnosa?')) {
      setHistory([]);
      localStorage.removeItem('diagnosis_history');
    }
  };


  /* =======================================================
     RENDER: HOME PAGE
     ======================================================= */
  const renderHome = () => (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-7 text-white shadow-lg">
        <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Sistem Pakar Diagnosa Komputer</h1>
        <p className="text-indigo-100 text-sm">Pilih gejala komputer untuk memulai analisis</p>
      </div>

      {/* GEJALA LIST */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <h2 className="text-xl font-semibold mb-5 flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <Stethoscope className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Pilih Gejala yang Dialami
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allSymptoms.map(symptom => (
            <label
              key={symptom}
              className={`
                flex items-center gap-3 p-4 border rounded-xl transition 
                cursor-pointer shadow-sm
                hover:shadow-md 
                ${selectedSymptoms.includes(symptom)
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-500'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50 hover:border-indigo-500 dark:hover:border-indigo-400'}
              `}
            >
              <input
                type="checkbox"
                checked={selectedSymptoms.includes(symptom)}
                onChange={() => handleSymptomToggle(symptom)}
                className="w-5 h-5 accent-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className={`font-medium ${selectedSymptoms.includes(symptom) ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                {symptom}
              </span>
            </label>
          ))}
        </div>
        {/* checkboxes */}
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
                  checked={symptoms.includes(symptom)}
                  onChange={() => handleSymptomToggle(symptom)}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="text-gray-700">{symptom}</span>
              </label>
            ))}
          </div>

        {/* BUTTONS */}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <button
            onClick={handleDiagnose}
            disabled={selectedSymptoms.length === 0}
            className="
              flex-1 py-3 rounded-xl font-semibold text-white 
              bg-gradient-to-r from-indigo-600 to-purple-600
              shadow-md hover:shadow-lg hover:brightness-110
              active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            Diagnosa Sekarang
          </button>

          <button
            onClick={handleReset}
            className="
              px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-600 font-medium 
              hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-[0.97] transition
              flex items-center justify-center gap-2 text-gray-700 dark:text-gray-200
            "
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
        </div>

      {/* HASIL DIAGNOSA */}
      {diagnosisResult && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 animate-fadeIn transition-colors duration-300">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Hasil Diagnosa</h2>

          {diagnosisResult.results.length > 0 ? (
            <>
              {/* CHART */}
              <div className="mb-8 mt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={diagnosisResult.results}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis
                      dataKey="nama_rule"
                      angle={-25}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 12, fill: isDarkMode ? '#d1d5db' : '#374151' }}
                    />
                    <YAxis tick={{ fill: isDarkMode ? '#d1d5db' : '#374151' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1f2937' : '#fff', 
                        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                        color: isDarkMode ? '#fff' : '#000'
                      }} 
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar 
                      dataKey="cf_percentage" 
                      fill="#6366f1" 
                      name="Persentase Keyakinan (%)"
                      radius={[6, 6, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* DETAIL LIST */}
              <div className="space-y-4">
                {diagnosisResult.results.map((result, index) => (
                  <div
                    key={result.id}
                    className="
                      border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl shadow-sm
                      hover:shadow-md transition
                    "
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
                        #{index + 1} {result.nama_rule}
                      </h3>

                      <span className="
                        bg-indigo-600 text-white px-3 py-1 rounded-full 
                        text-sm font-bold shadow
                      ">
                        {result.cf_percentage}%
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      <strong>Gejala cocok:</strong> {result.matching_symptoms} dari {result.total_symptoms}
                    </p>

                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong className="text-indigo-600 dark:text-indigo-400">Solusi:</strong> {result.solusi}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-5 italic">
              Tidak ada rule yang cocok. Coba pilih gejala lain.
            </p>
          )}
        </div>
      )}

    </div>
  );

  /* =======================================================
     RENDER: HISTORY PAGE
     ======================================================= */
  const renderHistory = () => (
    <div className="space-y-6">

      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Riwayat Diagnosa</h1>
        <p className="text-purple-100">Lihat hasil analisis sebelumnya</p>
      </div>

      {history.length > 0 ? (
        <>
          <div className="flex justify-end">
            <button
              onClick={handleClearHistory}
              className="bg-red-600 text-white px-4 py-2 rounded-xl font-semibold shadow hover:bg-red-700 active:scale-[0.98] transition flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Hapus Semua
            </button>
          </div>

          <div className="space-y-4">
            {history.map(item => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {new Date(item.timestamp).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                </p>

                <p className="text-gray-700 dark:text-gray-300 mt-1">
                  <strong>Gejala:</strong> <span className="italic text-gray-600 dark:text-gray-400">{item.symptoms.join(', ')}</span>
                </p>

                {item.results.length > 0 ? (
                  <div className="space-y-3 mt-4">
                    {item.results.map((result, index) => (
                      <div key={result.id} className="border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-r-lg">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                            #{index + 1} {result.nama_rule}
                          </h4>
                          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {result.cf_percentage}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 bg-white dark:bg-gray-800/50 p-2 rounded">{result.solusi}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic mt-3">Tidak ada hasil yang cocok.</p>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center border border-gray-100 dark:border-gray-700">
          <History className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">Belum ada riwayat diagnosa tersimpan.</p>

          <button
            onClick={() => setCurrentPage('home')}
            className="mt-6 bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg"
          >
            Mulai Diagnosa
          </button>
        </div>
      )}
    </div>
  );


  /* =======================================================
     RENDER MAIN
     ======================================================= */
  return (
    // Wrapper div untuk class 'dark'
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
        
        {/* NAV */}
        <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300 border-b dark:border-gray-700">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              
              {/* Menu Kiri */}
              <div className="flex gap-2 sm:gap-4">
                <button
                  onClick={() => setCurrentPage('home')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                    currentPage === 'home'
                      ? 'bg-indigo-600 text-white shadow-indigo-500/30 shadow-lg'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                  Diagnosa
                </button>

                <button
                  onClick={() => setCurrentPage('history')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                    currentPage === 'history'
                      ? 'bg-purple-600 text-white shadow-purple-500/30 shadow-lg'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <History className="w-4 h-4 sm:w-5 sm:h-5" />
                  Riwayat
                  {history.length > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">
                      {history.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Menu Kanan (Toggle Dark Mode) */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

            </div>
          </div>
        </nav>


        {/* CONTENT */}
        <main className="max-w-5xl mx-auto px-4 py-8">
          {currentPage === 'home' ? renderHome() : renderHistory()}
        </main>


        {/* FOOTER */}
        <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-12 py-8 transition-colors duration-300">
          <div className="max-w-5xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400">
            <p className="font-medium">Sistem Pakar Diagnosa Komputer</p>
            <p className="text-sm mt-1 opacity-70">Metode Certainty Factor • © {new Date().getFullYear()}</p>
          </div>
        </footer>

      </div>
    </div>
  );
}