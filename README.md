# Fin Smart App

Bu proje, Dumlupinar Universitesi Bilgisayar Muhendisligi bitirme projesi kapsaminda gelistirilmistir.

## Proje Bilgisi

- **Ogrenci:** Ali Kaan Koc
- **Universite:** Dumlupinar Universitesi
- **Bolum:** Bilgisayar Muhendisligi
- **Proje Konusu:** Kullanici risk profiline gore yatirim dagilimi ve senaryo bazli finansal oneriler

## Proje Ozeti

Fin Smart App; kullanicidan birikim tutari ve risk profili bilgilerini alarak:

- Risk profiline uygun portfoy dagilimi sunar,
- Canli piyasa verilerine dayali senaryo projeksiyonu hesaplar,
- Varlik kartlarinda volatiliteye gore risk uyarisi gosterir,
- Sonuc ekraninda varlik bazli kotumser / baz / iyimser tahminler uretir.

## Kullanilan Teknolojiler

- React
- Vite
- Tailwind CSS
- Lucide React

## Projeyi Calistirma Adimlari

### 1) Gereksinimler

- Node.js (onerilen: LTS surumu)
- npm

### 2) Projeyi indirme

```bash
git clone <repo-url>
cd fin-smart-app
```

> Proje zaten bilgisayarinizda varsa bu adimi atlayabilirsiniz.

### 3) Bagimliliklari yukleme

```bash
npm install
```

### 4) Gelistirme ortamini baslatma

```bash
npm run dev
```

Ardindan terminalde verilen adrese gidin (genellikle `http://localhost:5173`).

### 5) Production build alma

```bash
npm run build
```

### 6) Lint kontrolu

```bash
npm run lint
```

## Notlar

- Proje gelistirme surecinde canli veri servisleri kullanilmaktadir.
- Ag veya servis kaynakli gecici kesintilerde bazi veriler gec gelebilir.
