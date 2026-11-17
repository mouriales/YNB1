import fs from 'node:fs';
import path from 'node:path';
import type {
  AboutContent,
  AdminAccount,
  ContentItem,
} from '../src/types.ts';
import { hashPassword } from './auth.ts';

export interface StoredAdminUser extends AdminAccount {
  passwordHash: string;
}

export interface VolunteerRecord {
  id: string;
  campaignId: string;
  name: string;
  email: string;
  amount: number;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

export interface DatabaseState {
  posts: ContentItem[];
  carouselIds: string[];
  about: AboutContent;
  admins: StoredAdminUser[];
  volunteers: VolunteerRecord[];
  newsletterSubscribers: NewsletterSubscriber[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function createInitialState(): DatabaseState {
  const posts: ContentItem[] = [
    {
      id: 'fokus-coral-reef',
      section: 'fokus',
      category: { id: 'Restorasi Karang', en: 'Coral Restoration' },
      title: {
        id: 'Restorasi Terumbu Karang Berbasis Rangka Modular',
        en: 'Modular Reef Frame Coral Restoration',
      },
      excerpt: {
        id: 'Merehabilitasi 14.200 fragmen karang di Kepulauan Seribu dan Taman Nasional Komodo bersama penyelam lokal.',
        en: 'Rehabilitating 14,200 coral fragments across Thousand Islands and Komodo corridors alongside local dive stewards.',
      },
      body: {
        id: 'Program Restorasi Terumbu Karang Yayasan Nata Bahari memadukan struktur rangka baja berlapis mineral ramah lingkungan dengan pemantauan biologis triwulanan. Setiap fragmen karang Acropora yang patah akibat gelombang badai dikumpulkan dari zona penyangga, dirawat di meja pembibitan bawah laut selama 90 hari, lalu ditransplantasikan kembali ke titik terumbu yang terdegradasi. Tingkat keberhasilan hidup koloni mencapai 84% dalam pemantauan 18 bulan terakhir.',
        en: 'Yayasan Nata Bahari’s Coral Reef Restoration program combines mineral-coated modular frames with quarterly ecological monitoring. Storm-dislodged Acropora fragments are rescued from buffer zones, nurtured on underwater nursery tables for 90 days, and outplanted onto degraded reef slopes. Colony survival rates reached 84% across our latest 18-month survey window.',
      },
      imageUrl: '/src/assets/images/coral_reef_restoration_1794901794261.jpg',
      publishedAt: '2026-10-18',
      author: 'Dr. Narendra Putra',
      location: 'Kepulauan Seribu, DKI Jakarta',
    },
    {
      id: 'fokus-mangrove',
      section: 'fokus',
      category: { id: 'Konservasi Mangrove', en: 'Mangrove Conservation' },
      title: {
        id: 'Sabuk Hijau Mangrove Penahan Abrasi Pesisir Utara',
        en: 'North Coast Mangrove Greenbelt Shield',
      },
      excerpt: {
        id: 'Penanaman dan pengayaan 48 hektar hutan mangrove sebagai benteng alami pesisir dan penyerap karbon biru.',
        en: 'Replanting and enriching 48 hectares of coastal mangrove forests as natural wave barriers and blue-carbon sinks.',
      },
      body: {
        id: 'Sabuk mangrove di sepanjang pesisir utara Jawa dan Teluk Jakarta memegang peran vital dalam meredam energi gelombang pasang serta menahan intrusi air laut. Bersama kelompok tani tambak dan ibu-ibu pesisir Muara Angke, tim Nata Bahari mengembangkan pembibitan Rhizophora mucronata dan Avicennia marina dengan pola hidrologi pasang surut alami sehingga akar napas tumbuh kuat.',
        en: 'Mangrove belts along the northern Java coast and Jakarta Bay absorb tidal surge energy and prevent saltwater intrusion. Working with brackish-pond farmers and women’s coastal cooperatives in Muara Angke, our team cultivates Rhizophora mucronata and Avicennia marina nurseries engineered around natural tidal hydrology.',
      },
      imageUrl: '/src/assets/images/mangrove_coastal_forest_1794901795030.jpg',
      publishedAt: '2026-10-10',
      author: 'Siti Rahmawati, M.Si.',
      location: 'Muara Angke & Tangerang',
    },
    {
      id: 'fokus-edukasi',
      section: 'fokus',
      category: { id: 'Edukasi Bahari', en: 'Marine Education' },
      title: {
        id: 'Sekolah Pesisir & Perlindungan Penyu Generasi Muda',
        en: 'Coastal School & Youth Sea Turtle Stewardship',
      },
      excerpt: {
        id: 'Kurikulum literasi laut untuk 32 desa pesisir dan pemantauan sarang penyu sisik bersama pelajar setempat.',
        en: 'Ocean literacy workshops across 32 coastal villages and community-led hawksbill sea turtle nest protection.',
      },
      body: {
        id: 'Pelestarian laut jangka panjang membutuhkan keterlibatan aktif generasi muda pesisir. Melalui Sekolah Pesisir Nata Bahari, siswa sekolah dasar dan menengah mengikuti kelas lapangan identifikasi lamun, tata kelola sampah plastik, serta teknik patroli malam untuk melindungi sarang penyu sisik dan penyu hijau dari predator maupun perburuan telur.',
        en: 'Lasting marine conservation depends on coastal youth leadership. Through the Nata Bahari Coastal School, students participate in hands-on seagrass mapping, plastic waste audits, and supervised night patrols that safeguard hawksbill and green sea turtle nests along vulnerable nesting beaches.',
      },
      imageUrl: '/src/assets/images/marine_turtle_education_1794901795214.jpg',
      publishedAt: '2026-09-24',
      author: 'Larasati Dewi',
      location: 'Pangumbahan & Karimunjawa',
    },
    {
      id: 'fokus-perikanan',
      section: 'fokus',
      category: { id: 'Perikanan Berkelanjutan', en: 'Sustainable Fisheries' },
      title: {
        id: 'Kemitraan Nelayan Kecil & Alat Tangkap Selektif',
        en: 'Small-Scale Fisher Co-Management & Selective Gear',
      },
      excerpt: {
        id: 'Pendampingan nelayan pancing ulur tradisional dalam pencatatan hasil tangkapan dan zona larang ambil musiman.',
        en: 'Partnering with traditional handline fishers on catch traceability and seasonal community no-take zones.',
      },
      body: {
        id: 'Yayasan Nata Bahari mendampingi lebih dari 180 nelayan skala kecil untuk beralih ke alat tangkap pancing ulur selektif yang ramah terumbu karang. Dengan sistem pencatatan tangkapan digital sederhana dan kesepakatan zona lindung desa, biomassa ikan karang di perairan mitra meningkat rata-rata 27% dalam dua tahun.',
        en: 'Yayasan Nata Bahari works alongside more than 180 small-scale fishers transitioning to reef-safe selective handline gear. Supported by lightweight catch logbooks and village-managed seasonal closures, reef fish biomass across partner waters rose by an average of 27% over two years.',
      },
      imageUrl: '/src/assets/images/sustainable_fisheries_boat_1794901796502.jpg',
      publishedAt: '2026-09-12',
      author: 'Budi Santoso',
      location: 'Wakatobi & Maluku Tengah',
    },
    {
      id: 'konservasi-adopsi-karang',
      section: 'konservasi',
      category: { id: 'Adopsi Karang', en: 'Coral Adoption' },
      title: {
        id: 'Program Adopsi 5.000 Fragmen Karang Kepulauan Seribu',
        en: 'Adopt 5,000 Coral Fragments in Thousand Islands',
      },
      excerpt: {
        id: 'Dukung penanaman fragmen karang dengan koordinat GPS dan laporan foto pertumbuhan berkala.',
        en: 'Sponsor modular reef fragments tagged with GPS coordinates and quarterly underwater growth photography.',
      },
      body: {
        id: 'Setiap komitmen adopsi fragmen karang mendanai penyediaan rangka tanam bebas karat, upah penyelam restorasi lokal, serta pemantauan kesehatan terumbu selama 12 bulan penuh. Pendukung akan menerima sertifikat koordinat tanam dan pembaruan foto kondisi koloni.',
        en: 'Each coral adoption pledge funds corrosion-resistant nursery frames, stipends for local restoration divers, and 12 months of reef health monitoring. Supporters receive planting GPS coordinates and periodic photo updates of their colony.',
      },
      imageUrl: '/src/assets/images/coral_reef_restoration_1794901794261.jpg',
      publishedAt: '2026-11-02',
      author: 'Divisi Kemitraan Bahari',
      location: 'Pulau Pramuka, Kepulauan Seribu',
      targetGoal: 5000,
      currentProgress: 3420,
      unitLabel: { id: 'Fragmen Karang', en: 'Coral Fragments' },
      ctaLabel: { id: 'Adopsi Karang', en: 'Sponsor Coral' },
    },
    {
      id: 'konservasi-bersih-pesisir',
      section: 'konservasi',
      category: { id: 'Relawan Pesisir', en: 'Coastal Volunteers' },
      title: {
        id: 'Aksi Relawan Pembersihan Pesisir & Audit Sampah Laut',
        en: 'Coastal Cleanup & Marine Debris Audit Drive',
      },
      excerpt: {
        id: 'Bergabung dalam jadwal bersih pantai akhir pekan sekaligus mendata jenis plastik pesisir bersama peneliti.',
        en: 'Join our weekend shoreline cleanups and categorize collected marine debris with field researchers.',
      },
      body: {
        id: 'Setiap akhir pekan kedua, relawan Yayasan Nata Bahari turun ke kawasan Muara Angke dan pesisir pulau-pulau terdekat untuk membersihkan sampah kiriman serta memilah plastik bernilai daur ulang. Seluruh data jenis kemasan dicatat untuk advokasi pengurangan plastik sekali pakai.',
        en: 'Every second weekend, Yayasan Nata Bahari volunteers gather at Muara Angke and nearby island shorelines to remove washed-up debris and sort recyclable polymers. Brand and material logs directly inform municipal single-use plastic reduction policy.',
      },
      imageUrl: '/src/assets/images/ocean_cleanup_campaign_1794901796443.jpg',
      publishedAt: '2026-11-08',
      author: 'Koordinator Relawan',
      location: 'Teluk Jakarta',
      targetGoal: 300,
      currentProgress: 214,
      unitLabel: { id: 'Relawan Terdaftar', en: 'Registered Volunteers' },
      ctaLabel: { id: 'Daftar Relawan', en: 'Join as Volunteer' },
    },
    {
      id: 'konservasi-mangrove-hijau',
      section: 'konservasi',
      category: { id: 'Donasi Bibit', en: 'Seedling Fund' },
      title: {
        id: 'Gerakan 10.000 Bibit Mangrove untuk Desa Pesisir',
        en: '10,000 Mangrove Seedlings for Coastal Villages',
      },
      excerpt: {
        id: 'Kontribusi pengadaan bibit mangrove unggul dan pemeliharaan selama dua tahun pertama pertumbuhan.',
        en: 'Fund hardy coastal mangrove seedlings along with two-year community survival stewardship.',
      },
      body: {
        id: 'Keberhasilan rehabilitasi mangrove tidak berhenti pada hari penanaman. Dana kampanye ini dialokasikan penuh untuk pembibitan lokal, pemasangan pemecah gelombang bambu sementara, serta pengawasan bulanan oleh kelompok masyarakat pengawas pesisir.',
        en: 'Mangrove rehabilitation succeeds through multi-year care, not one-day planting events. Campaign funds support local community nurseries, temporary bamboo wave-breakers, and monthly survival checks by village coastal guardians.',
      },
      imageUrl: '/src/assets/images/mangrove_coastal_forest_1794901795030.jpg',
      publishedAt: '2026-10-29',
      author: 'Tim Ekosistem Pesisir',
      location: 'Pesisir Utara Jakarta & Banten',
      targetGoal: 10000,
      currentProgress: 7650,
      unitLabel: { id: 'Bibit Mangrove', en: 'Mangrove Seedlings' },
      ctaLabel: { id: 'Donasi Bibit', en: 'Fund Seedlings' },
    },
    {
      id: 'kabar-ekspedisi-riset',
      section: 'kabar',
      category: { id: 'Riset', en: 'Research' },
      title: {
        id: 'Ekspedisi Pemetaan Kualitas Air & Suhu Permukaan Laut 2026',
        en: '2026 Water Quality & Sea Surface Thermal Survey',
      },
      excerpt: {
        id: 'Kapal riset Samudra 01 menyelesaikan 42 titik pengukuran salinitas, oksigen terlarut, dan pemutihan karang.',
        en: 'Research vessel Samudra 01 completes 42 monitoring stations measuring salinity, dissolved oxygen, and bleaching resilience.',
      },
      body: {
        id: 'Tim oseanografi Yayasan Nata Bahari merampungkan ekspedisi selama 21 hari melintasi gugus terumbu barat hingga perairan selat Sunda. Data sensor CTD menunjukkan zona terumbu dengan tutupan mangrove pesisir yang utuh memiliki stabilitas pH lebih baik dan pemulihan karang pasca-pemanasan yang lebih cepat.',
        en: 'Yayasan Nata Bahari oceanographers concluded a 21-day expedition from the western reef clusters to the Sunda Strait. CTD sensor profiles confirm that reefs adjacent to intact mangrove coastlines maintain more stable pH levels and recover faster following thermal stress events.',
      },
      imageUrl: '/src/assets/images/marine_research_vessel_1794901795836.jpg',
      publishedAt: '2026-11-11',
      author: 'Dr. Narendra Putra',
      location: 'Selat Sunda & Kepulauan Seribu',
    },
    {
      id: 'kabar-pelepasan-penyu',
      section: 'kabar',
      category: { id: 'Lapangan', en: 'Field Dispatch' },
      title: {
        id: '340 Tukik Penyu Sisik Dilepasliarkan Bersama Pelajar Pesisir',
        en: '340 Hawksbill Hatchlings Released with Coastal Students',
      },
      excerpt: {
        id: 'Kolaborasi kelompok pelestari penyu dan sekolah dasar pesisir mencatat rekor tingkat penetasan alami.',
        en: 'Collaboration between local turtle rangers and coastal elementary schools marks a record natural hatching season.',
      },
      body: {
        id: 'Sebanyak 340 tukik penyu sisik (Eretmochelys imbricata) berhasil dilepasliarkan saat fajar setelah melalui inkubasi semi-alami selama 58 hari. Kegiatan ini menjadi penutup rangkaian lokakarya ekologi pantai bagi 65 siswa dan guru pendamping.',
        en: 'A total of 340 hawksbill sea turtle hatchlings (Eretmochelys imbricata) were released at dawn following 58 days of protected incubation. The release concluded a week-long coastal ecology workshop attended by 65 local students and teachers.',
      },
      imageUrl: '/src/assets/images/marine_turtle_education_1794901795214.jpg',
      publishedAt: '2026-11-05',
      author: 'Larasati Dewi',
      location: 'Kepulauan Seribu Utara',
    },
    {
      id: 'kabar-kemitraan-nelayan',
      section: 'kabar',
      category: { id: 'Siaran Pers', en: 'Press Release' },
      title: {
        id: 'Deklarasi Zona Tangkap Ramah Terumbu di Tiga Desa Mitra',
        en: 'Three Partner Villages Declare Reef-Safe Fishing Zones',
      },
      excerpt: {
        id: 'Kesepakatan masyarakat adat dan koperasi nelayan menetapkan 620 hektar perairan bebas pukat dasar.',
        en: 'Coastal cooperatives establish 620 hectares of bottom-trawl-free community fisheries management waters.',
      },
      body: {
        id: 'Tiga koperasi nelayan tradisional resmi menandatangani piagam pengelolaan perairan lestari bersama Yayasan Nata Bahari. Kesepakatan ini melindungi area pemijahan ikan kerapu dan kakap sekaligus membuka akses pasar bernilai tambah bagi tangkapan pancing ulur bersertifikat ramah lingkungan.',
        en: 'Three traditional fisher cooperatives formally signed a sustainable marine stewardship charter with Yayasan Nata Bahari. The agreement safeguards grouper and snapper spawning aggregations while connecting eco-certified handline catches to fair-trade buyers.',
      },
      imageUrl: '/src/assets/images/sustainable_fisheries_boat_1794901796502.jpg',
      publishedAt: '2026-10-25',
      author: 'Humas Nata Bahari',
      location: 'Jakarta & Sulawesi Tenggara',
    },
    {
      id: 'kabar-audit-plastik',
      section: 'kabar',
      category: { id: 'Edukasi', en: 'Education' },
      title: {
        id: 'Laporan Tahunan Audit Sampah Pesisir Teluk Jakarta',
        en: 'Annual Jakarta Bay Shoreline Debris Audit Report',
      },
      excerpt: {
        id: 'Lebih dari 4,2 ton sampah pesisir berhasil dievakuasi sepanjang 2026 melalui 24 aksi gotong royong komunitas.',
        en: 'Over 4.2 metric tons of shoreline debris removed in 2026 across 24 community cleanup drives.',
      },
      body: {
        id: 'Laporan tahunan audit sampah laut menunjukkan penurunan 18% rasio jaring ikan terbengkalai di titik pantau utama setelah program penukaran jaring rusak diberlakukan bersama komunitas perahu pesisir.',
        en: 'Our annual marine debris audit recorded an 18% reduction in abandoned fishing gear across primary transect beaches following the introduction of our coastal net-exchange incentive program.',
      },
      imageUrl: '/src/assets/images/ocean_cleanup_campaign_1794901796443.jpg',
      publishedAt: '2026-10-14',
      author: 'Tim Advokasi Pesisir',
      location: 'Muara Angke, Jakarta Utara',
    },
  ];

  const carouselIds = [
    'fokus-coral-reef',
    'fokus-mangrove',
    'konservasi-adopsi-karang',
    'kabar-ekspedisi-riset',
    'fokus-edukasi',
    'kabar-kemitraan-nelayan',
  ];

  const about: AboutContent = {
    profile: {
      id: 'Yayasan Nata Bahari adalah organisasi nirlaba konservasi kelautan Indonesia yang berdiri untuk memulihkan ekosistem terumbu karang, hutan mangrove, dan ketahanan masyarakat pesisir melalui riset ilmiah terapan serta aksi kolaboratif.',
      en: 'Yayasan Nata Bahari is an Indonesian non-profit marine conservation foundation dedicated to restoring coral reefs, coastal mangrove belts, and fisher community resilience through applied marine science and collaborative field action.',
    },
    vision: {
      id: 'Terwujudnya laut Nusantara yang sehat, berdaya lenting terhadap perubahan iklim, dan menghidupi masyarakat pesisir secara adil dan berkelanjutan.',
      en: 'A thriving Indonesian archipelago of resilient ocean ecosystems that sustains coastal communities equitably for generations to come.',
    },
    mission: [
      {
        id: 'Merehabilitasi habitat kritis terumbu karang, padang lamun, dan sabuk mangrove pesisir berbasis pemantauan ilmiah.',
        en: 'Rehabilitate critical coral reef, seagrass, and coastal mangrove habitats guided by longitudinal ecological monitoring.',
      },
      {
        id: 'Memberdayakan nelayan skala kecil melalui alat tangkap selektif dan tata kelola zona lindung laut berbasis masyarakat.',
        en: 'Partner with small-scale fishers on selective gear adoption and community-governed marine protected zones.',
      },
      {
        id: 'Membangun literasi kelautan dan keterlibatan publik melalui pendidikan pesisir serta aksi kerelawanan terbuka.',
        en: 'Advance ocean literacy and civic stewardship through coastal youth education and transparent volunteer programs.',
      },
    ],
    email: 'sekretariat@natabahari.org',
    phone: '+62 21 5550 8420',
    address: {
      id: 'Stasiun Pesisir & Pusat Riset Nata Bahari, Jl. Dermaga Muara Angke No. 14, Pluit, Penjaringan, Jakarta Utara 14450',
      en: 'Nata Bahari Coastal Station & Research Center, Jl. Dermaga Muara Angke No. 14, Pluit, North Jakarta 14450',
    },
    officeName: 'Stasiun Pesisir Yayasan Nata Bahari (Jakarta Utara)',
    lat: -6.1088,
    lng: 106.7745,
    instagram: '@natabahari.id',
    linkedin: 'linkedin.com/company/yayasan-nata-bahari',
    youtube: 'youtube.com/@natabahari',
  };

  const admins: StoredAdminUser[] = [
    {
      id: 'admin-super-1',
      name: 'Narendra Putra (Super Admin)',
      email: 'superadmin@natabahari.org',
      role: 'super_admin',
      createdAt: '2026-01-10',
      passwordHash: hashPassword('NataSuper2026!'),
    },
    {
      id: 'admin-editor-1',
      name: 'Siti Rahmawati (Admin Konten)',
      email: 'admin@natabahari.org',
      role: 'admin',
      createdAt: '2026-02-14',
      passwordHash: hashPassword('NataAdmin2026!'),
    },
  ];

  return {
    posts,
    carouselIds,
    about,
    admins,
    volunteers: [],
    newsletterSubscribers: [],
  };
}

export function loadDatabase(): DatabaseState {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial = createInitialState();
    saveDatabase(initial);
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw) as DatabaseState;
    if (!parsed.posts || !parsed.about || !parsed.admins) {
      const initial = createInitialState();
      saveDatabase(initial);
      return initial;
    }
    if (!Array.isArray(parsed.volunteers)) {
      parsed.volunteers = [];
    }
    if (!Array.isArray(parsed.newsletterSubscribers)) {
      parsed.newsletterSubscribers = [];
    }
    return parsed;
  } catch {
    const initial = createInitialState();
    saveDatabase(initial);
    return initial;
  }
}

export function saveDatabase(state: DatabaseState): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2), 'utf8');
  fs.renameSync(tmpFile, DB_FILE);
}
