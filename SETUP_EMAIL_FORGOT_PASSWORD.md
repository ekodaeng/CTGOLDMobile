# Setup Email untuk Forgot Password

## Status Saat Ini

Halaman forgot password sudah berfungsi **TANPA ERROR**, namun email mungkin tidak terkirim karena Supabase Email SMTP belum dikonfigurasi.

## Cara Setup Email (WAJIB untuk Production)

### Opsi 1: Setup Supabase Auth Email (Tercepat - 5 Menit)

#### Langkah 1: Buka Supabase Dashboard
1. Login ke [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Pilih project: **popbrkxeqstwvympjucc**
3. Navigasi ke: **Project Settings** → **Auth**

#### Langkah 2: Aktifkan SMTP
Scroll ke bagian **SMTP Settings** dan klik **Enable Custom SMTP**

#### Langkah 3: Konfigurasi Gmail (Gratis)

**A. Buat App Password di Gmail:**
1. Buka [Google Account Security](https://myaccount.google.com/security)
2. Aktifkan **2-Step Verification** jika belum
3. Klik **App passwords** (cari di search box jika tidak terlihat)
4. Pilih **Mail** → **Other** → Ketik "Supabase CTGOLD"
5. Klik **Generate**
6. Copy 16-digit password (contoh: `abcd efgh ijkl mnop`)

**B. Isi Form SMTP di Supabase:**
```
Host: smtp.gmail.com
Port Number: 587
Minimum interval between emails (seconds): 3
Sender email: youremail@gmail.com
Sender name: CTGOLD
Username: youremail@gmail.com
Password: [paste 16-digit app password dari step A]
```

#### Langkah 4: Tes Konfigurasi
1. Klik **Save** di bagian bawah form
2. Klik **Send Test Email**
3. Masukkan email Anda
4. Cek inbox (atau folder spam)
5. Jika email masuk = **SUKSES!** ✅

#### Langkah 5: Selesai!
Sekarang halaman forgot password akan mengirim email dengan benar.

---

### Opsi 2: Setup dengan Resend (Recommended untuk Production)

Jika ingin email lebih professional dan reliable:

#### Langkah 1: Daftar Resend
1. Buka [https://resend.com/signup](https://resend.com/signup)
2. Sign up (gratis 3000 email/bulan)
3. Verify email

#### Langkah 2: Dapatkan API Key
1. Di Resend Dashboard, klik **API Keys**
2. Klik **Create API Key**
3. Beri nama: "CTGOLD Production"
4. Copy API Key (format: `re_xxxxxxxxxxxx`)

#### Langkah 3: Tambah ke Supabase
1. Di Supabase Dashboard: **Project Settings** → **Edge Functions**
2. Scroll ke **Environment Variables**
3. Klik **Add new secret**
   - Name: `RESEND_API_KEY`
   - Value: [paste API key dari step 2]
4. Klik **Save**

#### Langkah 4: Deploy Edge Function
Edge function sudah tersedia, tinggal deploy:

```bash
# File sudah ada di: supabase/functions/request-reset-password/index.ts
# Akan otomatis terdeteksi dan deployed
```

---

## Troubleshooting

### Email Tidak Terkirim

**Cek 1: Halaman Tidak Error**
- Jika tombol "Kirim Link Reset" bisa diklik dan muncul pesan sukses = kode sudah benar ✅
- Error hanya ada di pengiriman email

**Cek 2: Verifikasi SMTP Settings**
1. Buka Supabase Dashboard → Project Settings → Auth
2. Pastikan Custom SMTP **enabled** (toggle ON)
3. Pastikan semua field terisi dengan benar
4. Password Gmail harus **App Password** (16 digit), BUKAN password biasa

**Cek 3: Test Langsung di Dashboard**
1. Di SMTP Settings, klik **Send Test Email**
2. Jika gagal = ada masalah di konfigurasi SMTP
3. Jika berhasil = cek Supabase logs untuk error

**Cek 4: Periksa Supabase Logs**
1. Dashboard → Logs → Auth Logs
2. Cari error terkait email sending
3. Biasanya error: invalid credentials, SMTP connection failed, dll

### Email Masuk ke Spam

**Solusi Sementara:**
- Minta user whitelist email sender
- Cek folder spam

**Solusi Permanen:**
- Gunakan Resend dengan verified domain
- Setup SPF, DKIM, DMARC records

---

## Testing Checklist

Setelah setup, tes dengan langkah ini:

1. [ ] Buka https://ctgold.io/member/forgot-password
2. [ ] Masukkan email yang terdaftar (contoh: instamakassar@gmail.com)
3. [ ] Klik "Kirim Link Reset"
4. [ ] Pastikan tidak ada error di halaman ✅
5. [ ] Cek email inbox (tunggu 1-2 menit)
6. [ ] Jika email masuk, klik link di email
7. [ ] Pastikan redirect ke halaman reset password
8. [ ] Reset password dan login dengan password baru
9. [ ] **SUKSES!** ✅

---

## FAQ

**Q: Kenapa UI bilang sukses tapi email tidak masuk?**
A: Untuk keamanan, UI selalu show success (prevent email enumeration). Email tidak masuk karena SMTP belum dikonfigurasi.

**Q: Harus bayar untuk kirim email?**
A: TIDAK. Gmail gratis (dengan App Password). Resend juga gratis 3000 email/bulan.

**Q: Berapa lama setup?**
A: 5-10 menit untuk Gmail, 15 menit untuk Resend + custom domain.

**Q: Email saya Gmail, apa bisa?**
A: Bisa! Ikuti Opsi 1 di atas.

**Q: Link reset berapa lama valid?**
A: Default 1 jam. Bisa diubah di Auth Settings.

---

## Recommended: Gmail untuk Development, Resend untuk Production

**Development/Testing:**
- Gunakan Gmail dengan App Password
- Gratis dan cepat setup
- Cukup untuk testing

**Production:**
- Gunakan Resend dengan custom domain
- Lebih professional (from: noreply@ctgold.io)
- Better deliverability
- Email analytics

---

## Next Steps

1. **Pilih opsi:** Gmail (cepat) atau Resend (professional)
2. **Ikuti langkah setup** di atas
3. **Tes forgot password** dengan email real
4. **Verify email terkirim**
5. **Done!** ✅

Jika ada masalah, cek Troubleshooting section atau contact developer.
