'use client'

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trash2, RotateCcw, Stethoscope, History, Home, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import LogoScroll from './components/LogoScroll';

// interface / tyoe
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

// const DETAILS = [
//   {
//     id: 1,
//     gejala: "Indikator Power mati",
//     youtube: ""
//   },
//   {
//     id: 2,
//     gejala: "Kipas diam",
//     youtube: ""
//   },
//   {
//     id: 3,
//     gejala: "LED pada motherboard mati",
//     youtube: ""
//   },
//   {
//     id: 4,
//     gejala: "Bunyi beep 3 kali",
//     youtube: ""
//   },
//   {
//     id: 5,
//     gejala: "Layar black screen/blank",
//     youtube: "https://youtu.be/KaoD3bNTC7Q?si=enK17GPKErBuRBG2&t=34"
//   },
//   {
//     id: 6,
//     gejala: "Komputer restart sendiri",
//     youtube: ""
//   },
//   {
//     id: 7,
//     gejala: "Bunyi klik",
//     youtube: ""
//   },
//   {
//     id: 8,
//     gejala: "Booting lambat",
//     youtube: ""
//   },
//   {
//     id: 9,
//     gejala: "Blue screen",
//     youtube: ""
//   },
//   {
//     id: 10,
//     gejala: "Kipas bising",
//     youtube: ""
//   },
//   {
//     id: 11,
//     gejala: "Performa lambat",
//     youtube: ""
//   },
//   {
//     id: 12,
//     gejala: "Muncul artefak pada layer",
//     youtube: ""
//   },
//   {
//     id: 13,
//     gejala: "Slot RAM tidak berfungsi",
//     youtube: ""
//   },
// ];

// Fungsi CF Combine
const cfCombine = (cf1:number, cf2:number):number => {
  return cf1 + cf2 * (1 - cf1);
};

// Fungsi menghitung CF untuk diagnosa
const calculateDiagnosis = (symptoms: Symptom[]) => {
  const results: ResultItem[] = [];
  
  RULES_DATA.forEach(rule => {
    const matchingSymptoms = rule.gejala.filter(g => 
      symptoms.includes(g)
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
const getAllSymptoms = (): Symptom[] => {
  const symptoms = new Set<string>();
  RULES_DATA.forEach(rule => {
    rule.gejala.forEach(g => symptoms.add(g));
  });
  return Array.from(symptoms).sort();
};

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [diagnosisResult, setDiagnosisResult] = useState<Diagnosis | null>(null);
  const [history, setHistory] = useState<Diagnosis[]>([]);
  const [allSymptoms] = useState(getAllSymptoms());

  const [details, setDetails] = useState(false);
  const [selectedSymptoms, setSelectedSymtoms] = useState();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLandingPage, setLandingPage] = useState(true);

  // Load history dari localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('diagnosis_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    } else if (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const handleSymptomToggle = (symptom: Symptom) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
    setSelectedSymtoms(symptom)
    setDetails(true)
  };

  const handleDiagnose = () => {
    if (symptoms.length === 0) {
      alert('Pilih minimal 1 gejala untuk diagnosa');
      return;
    }

    const results = calculateDiagnosis(symptoms);
    const diagnosis: Diagnosis = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      symptoms: [...symptoms],
      results
    };

    setDiagnosisResult(diagnosis);

    // Simpan ke history
    const newHistory = [diagnosis, ...history].slice(0, 10); // Max 10 history
    setHistory(newHistory);
    localStorage.setItem('diagnosis_history', JSON.stringify(newHistory));
  };

  const handleReset = () => {
    setSymptoms([]);
    setDiagnosisResult(null);
    if (details == true) {
      setDetails(false)
    }
  };

  const handleClearHistory = () => {
    if (confirm('Yakin ingin menghapus semua riwayat diagnosa?')) {
      setHistory([]);
      localStorage.removeItem('diagnosis_history');
    }
  };

  const renderHome = () => (
    <div className="flex justify-center items-start w-full">
      <div className="py-8 shrink-0 space-y-6 w-200">
        
        {/* heading */}
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl p-7 text-white shadow-lg">
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Sistem Pakar Diagnosa Komputer</h1>
          <p className="text-indigo-100 text-base">Pilih gejala yang dialami komputer Anda untuk mendapatkan solusi</p>
        </div>

        {/* checkboxes */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <h2 className="text-xl font-semibold mb-5 flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <Stethoscope className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Pilih Gejala
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allSymptoms.map(symptom => (
              <label
                key={symptom}
                className={`
                  flex items-center gap-3 p-4 border rounded-xl transition 
                  cursor-pointer shadow-sm
                  hover:shadow-md 
                  ${symptoms.includes(symptom)
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-500'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50 hover:border-indigo-500 dark:hover:border-indigo-400'}
                `}
              >
                <input
                  type="checkbox"
                  checked={symptoms.includes(symptom)}
                  onChange={() => handleSymptomToggle(symptom)}
                  className="w-5 h-5 accent-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className={`font-medium ${symptoms.includes(symptom) ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>{symptom}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleDiagnose}
              disabled={symptoms.length === 0}
              className="
              flex-1 py-3 rounded-xl font-semibold text-white 
              bg-linear-to-r from-indigo-600 to-purple-600
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
        </div>

        {diagnosisResult && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 animate-fadeIn transition-colors duration-300 w-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Hasil Diagnosa</h2>
            
            {diagnosisResult.results.length > 0 ? (
              <>
                <div className="mb-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={diagnosisResult.results}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                      <XAxis 
                        dataKey="nama_rule" 
                        angle={-45} 
                        textAnchor="end" 
                        height={120}
                        interval={0}
                        tick={{ fontSize: 12, fill: isDarkMode ? '#d1d5db' : '#374151' }}
                      />
                      <YAxis tick={{ fill: isDarkMode ? '#d1d5db' : '#374151' }} label={{ value: 'Persentase (%)', angle: -90, position: 'insideLeft' }} />
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
                      name="Certainty Factor (%)"
                      radius={[6, 6, 0, 0]} 
                    />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  {diagnosisResult.results.map((result, index) => (
                    <div 
                      key={result.id}
                      className="border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl shadow-sm
                      hover:shadow-md transition"
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
                Tidak ditemukan kerusakan yang sesuai dengan gejala yang dipilih.
              </p>
            )}
          </div>
        )}
      </div>
      {details && (
        <div className="mx-4 bg-sky-500 w-full h-dvh">
          <div>{selectedSymptoms}</div>
          <div></div>
          <div></div>
          <button onClick={() => setDetails(false)} className="mx-2 px-3 py-2 bg-white rounded-lg">Tutup</button>
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6 py-8">
      <div className="bg-linear-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Riwayat Diagnosa</h1>
        <p className="text-purple-100">Lihat kembali hasil diagnosa sebelumnya</p>
      </div>

      {history.length > 0 ? (
        <>
          <div className="flex justify-end">
            <button
              onClick={handleClearHistory}
              className="bg-red-600 text-white px-4 py-2 rounded-xl font-semibold shadow hover:bg-red-700 active:scale-[0.98] transition flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Hapus Riwayat
            </button>
          </div>

          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {new Date(item.timestamp).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">
                      <strong>Gejala:</strong> <span className="italic text-gray-600 dark:text-gray-400">{item.symptoms.join(', ')}</span>
                    </p>
                  </div>
                </div>

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

  return (
    <div className={`${isDarkMode ? 'dark' : ''} overflow-x-hidden overflow-y-hidden`}>
      {isLandingPage == true && (
        <div className="relative min-h-screen bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 text-sm">
          <header className="h-20 w-dvw px-6 sm:px-96 py-6">
            <nav className="flex justify-between items-center">
              <Link href="/" className="flex justify-center items-center gap-4 sm:gap-8">
                <Image src="/logo.png" alt="logo" width={200} height={100} className="invert-0 dark:invert w-12 h-auto" />
                <h1>Dawg Diag</h1>
              </Link>
              <div className="flex justify-center items-center gap-4 sm:gap-8">
                <button
                  onClick={toggleTheme}
                  className="flex gap-4 items-center p-2.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Toggle Dark Mode"
                  >
                  {isDarkMode ?
                    <>
                      <Sun className="w-5 h-5" />
                      <span className="hidden sm:block">
                        Mode Terang
                      </span>
                    </> : 
                    <>
                      <Moon className="w-5 h-5" />
                      <span className="hidden sm:block">
                        Mode Gelap
                      </span>
                    </>
                    }
                </button>
                <Link href="https://github.com/rzlmiooo/dawg-diag" target='_blank'>
                    <Image src="/github.svg" width={100} height={100} className='w-auto h-9 invert' />
                </Link>
              </div>
            </nav>
          </header>
          <main className="w-dvw h-full flex flex-col justify-center items-center">
            <div className='p-6 pb-18 px-6 sm:px-48 flex flex-col justify-center items-center'>
              <h1 className="pt-6 sm:pt-18 text-center text-xl sm:text-5xl tracking-tight leading-tight">Selamat Datang di <span className="px-3 dark:bg-gray-200 bg-gray-900 dark:text-gray-900 text-gray-100 font-semibold">Dawg Diag</span>
              </h1>
              <h2 className="text-2xl sm:text-3xl text-center pt-2 sm:pt-6">SISTEM DETEKSI DINI KERUSAKAN PADA KOMPUTER</h2>
              <p className="pt-12 text-center">Sistem ini merupakan sistem pakar untuk mendiagnosa kerusakan pada komputer, yang dirancang untuk membantu pengguna mengenali gejala kerusakan perangkat secara cepat, mudah, dan akurat. Dengan metode Forward Chaining dan Certainty Factor, sistem ini mampu memberikan kemungkinan penyebab kerusakan serta solusi penanganan yang tepat sebelum perangkat dibawa ke teknisi. Melalui antarmuka yang sederhana dan ramah pengguna, sistem ini dapat digunakan oleh siapa saja, termasuk pengguna yang tidak memiliki pengetahuan teknis mendalam mengenai komputer.</p>
              <button onClick={() => setLandingPage(false)} className="mt-8 px-3 py-2 flex w-fit dark:bg-gray-200 hover:bg-gray-2000 dark:hover:bg-gray-300 bg-gray-900 dark:text-gray-900 text-gray-100 text-3xl font-semibold transition-colors duration-300">Mulai Diagnosa</button>
            </div>

            <LogoScroll />
            
            <div className="hidden sm:flex gap-1 w-dvw items-center justify-center bg-gray-200 p-0.5 text-gray-50">
              <div className="text-5xl text-gray-900 pr-6">Our <br/>Team</div>
              <ul className="bg-gray-900 px-4 py-1 text-xl">
                <li>Mohammad Syfa EC (23051010xx)</li>
                <li>Rizal Maulana (2305101018)</li>
                <li>Varid Firmansyah (23051010xx)</li>
              </ul>
              <ul className="bg-gray-900 px-4 py-1 text-xl">
                <li>as Frontend Developer</li>
                <li>as Backend Developer</li>
                <li>as UI/UX Designer</li>
              </ul>
            </div>
          </main>
          <footer className="flex justify-center w-dvw py-8 text-sm">
            Copyright(C) 2025. Rizal, Syfa, dan Varid
          </footer>
        </div>
      )}

      {isLandingPage == false && (
        <div className="min-h-screen bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
          
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
                  className="flex gap-4 items-center p-2.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Toggle Dark Mode"
                  >
                  {isDarkMode ?
                    <>
                      <Sun className="w-5 h-5" />
                      Mode Terang
                    </> : 
                    <>
                      <Moon className="w-5 h-5" />
                      Mode Gelap
                    </>
                    }
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
      )}
    </div>
  );
}

export default App;