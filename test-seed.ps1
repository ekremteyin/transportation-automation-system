# Nakliye Sistemi - Test Verisi Olusturma Scripti
# Kullanim: .\test-seed.ps1

$BASE = "http://localhost:5000/api"
$ErrorActionPreference = "Stop"

function Log-Step { param($msg) Write-Host "`n>> $msg" -ForegroundColor Cyan }
function Log-OK   { param($msg) Write-Host "   [OK] $msg" -ForegroundColor Green }
function Log-Warn { param($msg) Write-Host "   [!!] $msg" -ForegroundColor Yellow }
function Log-Err  { param($msg) Write-Host "   [XX] $msg" -ForegroundColor Red }

function Invoke-Api {
    param([string]$Method, [string]$Path, $Body = $null, [string]$Token = $null)
    $h = @{ "Content-Type" = "application/json" }
    if ($Token) { $h["Authorization"] = "Bearer $Token" }
    $p = @{ Uri = "$BASE$Path"; Method = $Method; Headers = $h }
    if ($Body) { $p["Body"] = ($Body | ConvertTo-Json -Depth 5) }
    return Invoke-RestMethod @p
}

function Register-Or-Login {
    param($First, $Last, $Email, [int]$RoleInt, $Vehicle = $null, $City = $null)
    $body = @{ firstName=$First; lastName=$Last; email=$Email; password="Test@123"; phone="05301234567"; role=$RoleInt }
    if ($Vehicle) { $body["vehicleType"] = $Vehicle }
    if ($City)    { $body["city"]        = $City }
    try {
        $r = Invoke-Api -Method POST -Path "/auth/register" -Body $body
        Log-OK "Kayit: $First $Last"
        return @{ Token=$r.token; UserId=$r.userId }
    } catch {
        Log-Warn "$First $Last zaten kayitli - giris yapiliyor..."
        $r = Invoke-Api -Method POST -Path "/auth/login" -Body @{ email=$Email; password="Test@123" }
        Log-OK "Giris: $First $Last"
        return @{ Token=$r.token; UserId=$r.userId }
    }
}

# ================================================
# SIFIRLA: Mevcut test verilerini temizle
# ================================================
Log-Step "Mevcut test verileri temizleniyor..."
try {
    $sqlLines = @(
        "USE NakliyeDb;"
        "DELETE FROM Messages;"
        "DELETE FROM Notifications;"
        "DELETE FROM Reviews;"
        "DELETE FROM Offers;"
        "DELETE FROM Complaints;"
        "DELETE FROM Adverts;"
        "DELETE FROM Users WHERE Id != 1;"
        "DBCC CHECKIDENT ('Users', RESEED, 1);"
        "DBCC CHECKIDENT ('Adverts', RESEED, 0);"
        "DBCC CHECKIDENT ('Offers', RESEED, 0);"
        "DBCC CHECKIDENT ('Messages', RESEED, 0);"
        "DBCC CHECKIDENT ('Reviews', RESEED, 0);"
        "DBCC CHECKIDENT ('Notifications', RESEED, 0);"
    )
    $tmpFile = [System.IO.Path]::GetTempFileName() + ".sql"
    $sqlLines | Out-File -FilePath $tmpFile -Encoding utf8
    docker cp $tmpFile nakliye-mssql:/tmp/cleanup.sql | Out-Null
    docker exec nakliye-mssql bash -c "/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Nakliye_Strong@Pass123' -No -i /tmp/cleanup.sql" | Out-Null
    Remove-Item $tmpFile -Force -ErrorAction SilentlyContinue
    Log-OK "Test verileri temizlendi, IDENTITY sayaclari sifirlandi"
} catch {
    Log-Warn "DB temizleme atlaniyor: $_"
}

# --- API Erisim Kontrolu ---
Write-Host ""
Write-Host "=================================================" -ForegroundColor Blue
Write-Host "  Nakliye Sistemi - Test Verisi Olusturuluyor   " -ForegroundColor Blue
Write-Host "=================================================" -ForegroundColor Blue

Log-Step "API erisimi kontrol ediliyor..."
try {
    Invoke-RestMethod -Uri "$BASE/auth/login" -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body '{"email":"__probe__","password":"__probe__"}' | Out-Null
} catch {
    $code = 0
    if ($_.Exception.Response) { $code = $_.Exception.Response.StatusCode.value__ }
    if ($code -in @(400,401,422,500)) {
        Log-OK "API erisimi tamam (localhost:5000)"
    } else {
        Log-Err "API'ye baglanilamiyor! Docker calistirildi mi?"
        Log-Err "Komut: docker-compose up -d"
        exit 1
    }
}

# ================================================
# ADIM 1 - KULLANICILAR (role: 0=Sender, 1=Carrier)
# ================================================
Log-Step "Kullanicilar olusturuluyor..."
$ahmet  = Register-Or-Login "Ahmet"  "Yilmaz" "ahmet@test.com"  0
$mehmet = Register-Or-Login "Mehmet" "Kaya"   "mehmet@test.com" 0
$ali    = Register-Or-Login "Ali"    "Demir"  "ali@test.com"    1 "Kamyon" "Istanbul"
$veli   = Register-Or-Login "Veli"   "Celik"  "veli@test.com"   1 "TIR"    "Ankara"

# ================================================
# ADIM 2 - ILANLAR
# ================================================
Log-Step "Ahmet'in ilanları olusturuluyor (3 ilan)..."

$a1 = Invoke-Api -Method POST -Path "/adverts" -Token $ahmet.Token -Body @{
    cargoType="Ev Esyasi"; cargoWeight="3 ton"
    originCity="Istanbul"; originDistrict="Kadikoy"
    destCity="Ankara";     destDistrict="Cankaya"
    transportDate="2026-07-15T00:00:00Z"
    description="3 oda ev esyasi, nazik tasima gerekiyor"
}
Log-OK "Ilan #$($a1.id): Istanbul -> Ankara (Ev Esyasi)"

$a2 = Invoke-Api -Method POST -Path "/adverts" -Token $ahmet.Token -Body @{
    cargoType="Ticari Yuk"; cargoWeight="500 kg"
    originCity="Istanbul";  destCity="Izmir"
    transportDate="2026-07-20T00:00:00Z"
    description="Tekstil urunleri, 10 koli halinde paketli"
}
Log-OK "Ilan #$($a2.id): Istanbul -> Izmir (Ticari Yuk)"

$a3 = Invoke-Api -Method POST -Path "/adverts" -Token $ahmet.Token -Body @{
    cargoType="Palet"; cargoWeight="1 ton"
    originCity="Istanbul"; destCity="Bursa"
    transportDate="2026-07-10T00:00:00Z"
    description="8 palet, forklift gerekiyor"
}
Log-OK "Ilan #$($a3.id): Istanbul -> Bursa (Palet)"

Log-Step "Mehmet'in ilanları olusturuluyor (2 ilan)..."

$a4 = Invoke-Api -Method POST -Path "/adverts" -Token $mehmet.Token -Body @{
    cargoType="Makine"; cargoWeight="5 ton"
    originCity="Ankara";   originDistrict="Sincan"
    destCity="Istanbul";   destDistrict="Esenyurt"
    transportDate="2026-07-18T00:00:00Z"
    description="Tekstil makinesi, vinc yuklemesi zorunlu"
}
Log-OK "Ilan #$($a4.id): Ankara -> Istanbul (Makine)"

$a5 = Invoke-Api -Method POST -Path "/adverts" -Token $mehmet.Token -Body @{
    cargoType="Ticari Yuk"; cargoWeight="2 ton"
    originCity="Ankara";    destCity="Konya"
    transportDate="2026-07-25T00:00:00Z"
    description="Gida urunleri, soguk zincir gerekmez"
}
Log-OK "Ilan #$($a5.id): Ankara -> Konya (Ticari Yuk)"

# ================================================
# ADIM 3 - TEKLIFLER
# ================================================
Log-Step "Ali'nin teklifleri veriliyor..."

$o_ali_a1 = Invoke-Api -Method POST -Path "/offers" -Token $ali.Token -Body @{
    advertId=$a1.id; price=3500
    estimatedDate="2026-07-15T00:00:00Z"
    note="Profesyonel ekipman ve sigortali tasima. Asansorlu arac mevcut."
}
Log-OK "Teklif #$($o_ali_a1.id): Ali -> Ilan #$($a1.id) - 3500 TL"

$o_ali_a4 = Invoke-Api -Method POST -Path "/offers" -Token $ali.Token -Body @{
    advertId=$a4.id; price=4800
    estimatedDate="2026-07-18T00:00:00Z"
    note="Vinc ve ekipman temin edebilirim."
}
Log-OK "Teklif #$($o_ali_a4.id): Ali -> Ilan #$($a4.id) - 4800 TL"

Log-Step "Veli'nin teklifleri veriliyor..."

$o_veli_a1 = Invoke-Api -Method POST -Path "/offers" -Token $veli.Token -Body @{
    advertId=$a1.id; price=3200
    estimatedDate="2026-07-14T00:00:00Z"
    note="TIR ile guvenli tasima, bir gun erken teslim edebilirim."
}
Log-OK "Teklif #$($o_veli_a1.id): Veli -> Ilan #$($a1.id) - 3200 TL"

$o_veli_a2 = Invoke-Api -Method POST -Path "/offers" -Token $veli.Token -Body @{
    advertId=$a2.id; price=1800
    estimatedDate="2026-07-20T00:00:00Z"
    note="Arac bos, uygun fiyat verebiliyorum."
}
Log-OK "Teklif #$($o_veli_a2.id): Veli -> Ilan #$($a2.id) - 1800 TL"

# ================================================
# ADIM 4 - TEKLIF KABUL
# ================================================
Log-Step "Ahmet, Ali'nin teklifini kabul ediyor (Ilan #$($a1.id))..."
Invoke-Api -Method PUT -Path "/offers/$($o_ali_a1.id)/accept" -Token $ahmet.Token | Out-Null
Log-OK "Ilan #$($a1.id) -> Matched | Ali kabul, Veli otomatik reddedildi"

Log-Step "Mehmet, Ali'nin teklifini kabul ediyor (Ilan #$($a4.id))..."
Invoke-Api -Method PUT -Path "/offers/$($o_ali_a4.id)/accept" -Token $mehmet.Token | Out-Null
Log-OK "Ilan #$($a4.id) -> Matched"

# ================================================
# ADIM 5 - TASIMA DURUMU
# ================================================
Log-Step "Ali, Ilan #$($a1.id) tasımasini baslatiyor..."
Invoke-Api -Method PUT -Path "/adverts/$($a1.id)/status" -Token $ali.Token -Body @{ status="InProgress" } | Out-Null
Log-OK "Ilan #$($a1.id) -> InProgress"

Log-Step "Ali, Ilan #$($a1.id) tasımasini tamamliyor..."
Invoke-Api -Method PUT -Path "/adverts/$($a1.id)/status" -Token $ali.Token -Body @{ status="Completed" } | Out-Null
Log-OK "Ilan #$($a1.id) -> Completed"

Log-Step "Ali, Ilan #$($a4.id) tasımasini baslatiyor..."
Invoke-Api -Method PUT -Path "/adverts/$($a4.id)/status" -Token $ali.Token -Body @{ status="InProgress" } | Out-Null
Log-OK "Ilan #$($a4.id) -> InProgress"

# ================================================
# ADIM 6 - DEGERLENDIRME
# ================================================
Log-Step "Ahmet, Ali'yi degerlendiriyor (5 yildiz)..."
Invoke-Api -Method POST -Path "/reviews" -Token $ahmet.Token -Body @{
    advertId=$a1.id; reviewedId=$ali.UserId
    rating=5
    comment="Cok profesyonel, zamaninda teslim etti. Kesinlikle tavsiye ederim!"
} | Out-Null
Log-OK "Ali icin 5 yildiz birakildi"

# ================================================
# ADIM 7 - MESAJLAR
# ================================================
Log-Step "Ahmet <-> Ali mesajlasma (Teklif #$($o_ali_a1.id))..."

Invoke-Api -Method POST -Path "/messages" -Token $ahmet.Token -Body @{
    offerId=$o_ali_a1.id
    content="Merhaba Ali Bey, tasima gunu saat kacta orada olabilirsiniz? Ambalaj malzemesi getirir misiniz?"
} | Out-Null
Log-OK "Ahmet -> Ali: Saat ve ambalaj sorusu"

Invoke-Api -Method POST -Path "/messages" -Token $ali.Token -Body @{
    offerId=$o_ali_a1.id
    content="Merhaba Ahmet Bey, 15 Temmuz sabah 09:00'da orada olurum. Ambalaj malzemeleri de arabamda var, ek ucret almiyorum."
} | Out-Null
Log-OK "Ali -> Ahmet: Onay ve ambalaj bilgisi"

Invoke-Api -Method POST -Path "/messages" -Token $ahmet.Token -Body @{
    offerId=$o_ali_a1.id
    content="Harika, anlastik! Adres: Kadikoy Moda Cad. No:15 Kat:3. Kapici Hasan Bey'i arayin."
} | Out-Null
Log-OK "Ahmet -> Ali: Adres paylasimi"

Invoke-Api -Method POST -Path "/messages" -Token $ali.Token -Body @{
    offerId=$o_ali_a1.id
    content="Anlastik, 15 Temmuz sabah 09:00'da orada olacagim. Iyi gunler!"
} | Out-Null
Log-OK "Ali -> Ahmet: Onay mesaji"

Log-Step "Veli <-> Ahmet mesajlasma (Teklif #$($o_veli_a2.id))..."

Invoke-Api -Method POST -Path "/messages" -Token $veli.Token -Body @{
    offerId=$o_veli_a2.id
    content="Merhaba, Izmir'deki teslimat adresini ogrenebilir miyim? Rota planlamam gerekiyor."
} | Out-Null
Log-OK "Veli -> Ahmet: Adres sorusu"

Invoke-Api -Method POST -Path "/messages" -Token $ahmet.Token -Body @{
    offerId=$o_veli_a2.id
    content="Merhaba Veli Bey. Adres: Izmir/Konak, Anafartalar Cad. No:42. Depo 08:00-18:00 arasi acik, forklift var."
} | Out-Null
Log-OK "Ahmet -> Veli: Adres ve depo bilgisi"

Log-Step "Ali <-> Mehmet mesajlasma (Teklif #$($o_ali_a4.id))..."

Invoke-Api -Method POST -Path "/messages" -Token $ali.Token -Body @{
    offerId=$o_ali_a4.id
    content="Merhaba Mehmet Bey, makine yukleme icin adresinizi ve vinc durumunu ogrenebilir miyim?"
} | Out-Null
Log-OK "Ali -> Mehmet: Yukleme noktasi sorusu"

Invoke-Api -Method POST -Path "/messages" -Token $mehmet.Token -Body @{
    offerId=$o_ali_a4.id
    content="Merhaba Ali Bey. Adres: Sincan OSB, 3. Cad. No:8. Fabrika vinci mevcut, kapida Adem'i sorun."
} | Out-Null
Log-OK "Mehmet -> Ali: Fabrika adres bilgisi"

# ================================================
# OZET
# ================================================
Write-Host ""
Write-Host "=================================================" -ForegroundColor Green
Write-Host "  Test Verisi Basariyla Olusturuldu!            " -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Test Kullanicilari  (sifre: Test@123)" -ForegroundColor White
Write-Host "  Gonderici : ahmet@test.com   (Ahmet Yilmaz)"
Write-Host "  Gonderici : mehmet@test.com  (Mehmet Kaya)"
Write-Host "  Tasiyici  : ali@test.com     (Ali Demir - Kamyon)"
Write-Host "  Tasiyici  : veli@test.com    (Veli Celik - TIR)"
Write-Host ""
Write-Host "  Ilan Durumlari:" -ForegroundColor White
Write-Host "  #$($a1.id)  Istanbul -> Ankara  : Completed  (3 mesaj + 5 yildiz degerlendirme)"
Write-Host "  #$($a2.id)  Istanbul -> Izmir   : Open       (Veli teklif var + 2 mesaj)"
Write-Host "  #$($a3.id)  Istanbul -> Bursa   : Open       (teklif bekleniyor)"
Write-Host "  #$($a4.id)  Ankara   -> Istanbul: InProgress (Ali tasiyor + 2 mesaj)"
Write-Host "  #$($a5.id)  Ankara   -> Konya   : Open       (teklif bekleniyor)"
Write-Host ""
Write-Host "  4 kullanici | 5 ilan | 4 teklif | 2 kabul | 1 degerlendirme | 8 mesaj" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Admin: admin@nakliye.com / Admin@123" -ForegroundColor Cyan
Write-Host ""
