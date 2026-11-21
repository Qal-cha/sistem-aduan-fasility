import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.aduan.deleteMany();

  const now = Date.now();
  const hoursAgo = (h: number) => new Date(now - h * 60 * 60 * 1000);

  await prisma.aduan.createMany({
    data: [
      {
        pengadu: 'Ahmad Danial bin Razak',
        lokasi: 'Blok A - Bilik Kuliah 3',
        kategori_kerosakan: 'Penyaman Udara',
        tahap_keutamaan: 'Kritikal',
        status: 'Baru',
        createdAt: hoursAgo(1),
      },
      {
        pengadu: 'Nurul Aisyah binti Zulkifli',
        lokasi: 'Perpustakaan Tun Razak - Aras 2',
        kategori_kerosakan: 'Wi-Fi/Rangkaian',
        tahap_keutamaan: 'Kritikal',
        status: 'Dalam Tindakan',
        createdAt: hoursAgo(3),
      },
      {
        pengadu: 'Dr. Lim Wei Jian',
        lokasi: 'Makmal Komputer 1 - Blok C',
        kategori_kerosakan: 'Elektrik/Lampu',
        tahap_keutamaan: 'Sederhana',
        status: 'Baru',
        createdAt: hoursAgo(5),
      },
      {
        pengadu: 'Siti Hajar binti Mohamad',
        lokasi: 'Kolej Kediaman Melati - Aras 1 (Tandas Lelaki/Perempuan)',
        kategori_kerosakan: 'Paip/Air',
        tahap_keutamaan: 'Kritikal',
        status: 'Baru',
        createdAt: hoursAgo(7),
      },
      {
        pengadu: 'Muhammad Harith bin Ismail',
        lokasi: 'Dewan Kuliah Utama - Baris Hadapan',
        kategori_kerosakan: 'Perabot',
        tahap_keutamaan: 'Rendah',
        status: 'Dalam Tindakan',
        createdAt: hoursAgo(14),
      },
      {
        pengadu: 'Kavitha a/p Subramaniam',
        lokasi: 'Blok B - Bilik Seminar 2',
        kategori_kerosakan: 'Penyaman Udara',
        tahap_keutamaan: 'Sederhana',
        status: 'Dalam Tindakan',
        createdAt: hoursAgo(22),
      },
      {
        pengadu: 'Puan Rosmawati binti Ahmad',
        lokasi: 'Pejabat Pentadbiran - Kaunter Hadapan',
        kategori_kerosakan: 'Lain-lain',
        tahap_keutamaan: 'Sederhana',
        status: 'Selesai',
        createdAt: hoursAgo(36),
      },
      {
        pengadu: 'Amirul Hakim bin Fauzi',
        lokasi: 'Kafeteria Pusat - Ruang Makan Timur',
        kategori_kerosakan: 'Elektrik/Lampu',
        tahap_keutamaan: 'Rendah',
        status: 'Selesai',
        createdAt: hoursAgo(48),
      },
      {
        pengadu: 'Farah Nadia binti Azman',
        lokasi: 'Blok Kejuruteraan - Bengkel Mekanikal 2',
        kategori_kerosakan: 'Paip/Air',
        tahap_keutamaan: 'Rendah',
        status: 'Selesai',
        createdAt: hoursAgo(72),
      },
    ],
  });

  console.log('Seeded 9 Aduan records successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
