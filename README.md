# Fin Smart App

Bu proje, Dumlupınar Üniversitesi Bilgisayar Mühendisliği bitirme projesi kapsamında geliştirilmiştir.

## Proje Bilgisi

- **Öğrenci:** Ali Kaan Koç
- **Üniversite:** Dumlupınar Üniversitesi
- **Bölüm:** Bilgisayar Mühendisliği
- **Proje Konusu:** Kullanıcı risk profiline göre yatırım dağılımı ve senaryo bazlı finansal öneriler

## Proje Özeti

Fin Smart App; kullanıcıdan birikim tutarı ve risk profili bilgilerini alarak:

- Risk profiline uygun portföy dağılımı sunar,
- Canlı piyasa verilerine dayalı senaryo projeksiyonu hesaplar,
- Varlık kartlarında volatiliteye göre risk uyarısı gösterir,
- Sonuç ekranında varlık bazlı kötümser / baz / iyimser tahminler üretir.

## Kullanılan Teknolojiler

- React
- Vite
- Tailwind CSS
- Lucide React

## Projeyi Çalıştırma Adımları

### 1) Gereksinimler

- Node.js (önerilen: LTS sürümü)
- npm

### 2) Projeyi indirme

```bash
git clone <repo-url>
cd fin-smart-app
```

> Proje zaten bilgisayarınızda varsa bu adımı atlayabilirsiniz.

### 3) Bağımlılıkları yükleme

```bash
npm install
```

### 4) Geliştirme ortamını başlatma

```bash
npm run dev
```

Ardından terminalde verilen adrese gidin (genellikle `http://localhost:5173`).

### 5) Production build alma

```bash
npm run build
```

### 6) Lint kontrolü

```bash
npm run lint
```

## Notlar

- Proje geliştirme sürecinde canlı veri servisleri kullanılmaktadır.
- Ağ veya servis kaynaklı geçici kesintilerde bazı veriler geç gelebilir.
