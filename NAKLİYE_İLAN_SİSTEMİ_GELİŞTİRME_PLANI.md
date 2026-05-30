# 🚛 Nakliye İlan Sistemi — Geliştirme Planı

> **Bitirme Projesi** | ASP.NET Core + React + MSSQL | Docker Compose Ortamı

---

## İçindekiler

1. [Proje Genel Bakış](#1-proje-genel-bakış)
2. [Mimari Tasarım](#2-mimari-tasarım)
3. [Docker Altyapısı](#3-docker-altyapısı)
4. [Proje Dizin Yapısı](#4-proje-dizin-yapısı)
5. [Veritabanı Şeması](#5-veritabanı-şeması)
6. [Backend — ASP.NET Core API](#6-backend--aspnet-core-api)
7. [Frontend — React](#7-frontend--react)
8. [Modüller ve Geliştirme Sırası](#8-modüller-ve-geliştirme-sırası)
9. [API Endpoint Listesi](#9-api-endpoint-listesi)
10. [Güvenlik Tasarımı](#10-güvenlik-tasarımı)
11. [Geliştirme Aşamaları (Sprint Planı)](#11-geliştirme-aşamaları-sprint-planı)

---

## 1. Proje Genel Bakış

### Amaç
Göndericiler (müşteriler) ile taşıyıcıları (nakliyecileri) buluşturan, ilan ve teklif yönetimi yapabilen, taşıma sürecini uçtan uca takip ettiren web tabanlı bir platform.

### Kullanıcı Rolleri

| Rol | Açıklama |
|---|---|
| **Gönderici** | İlan oluşturan, teklifleri değerlendiren, taşıyıcıyı puanlayan kullanıcı |
| **Taşıyıcı** | İlanları listeleyen, teklif veren, taşıma durumunu güncelleyen kullanıcı |
| **Admin** | Tüm sistemi denetleyen, kullanıcıları/ilanları yöneten yönetici |

### Teknoloji Seçimleri

| Katman | Teknoloji |
|---|---|
| Backend API | ASP.NET Core 8 (C#) |
| Frontend | React 18 + Vite |
| Veritabanı | Microsoft SQL Server 2022 |
| ORM | Entity Framework Core 8 |
| Kimlik Doğrulama | JWT Bearer Token |
| Şifreleme | BCrypt.Net |
| Container | Docker + Docker Compose |
| API Dokümantasyonu | Swagger / OpenAPI |
| HTTP İstemcisi (FE) | Axios |
| UI Kütüphanesi | Tailwind CSS + shadcn/ui |

---

## 2. Mimari Tasarım

### 2.1 Genel Mimari — Clean Architecture

Proje, **Clean Architecture** prensiplerine göre katmanlara ayrılmıştır. Her katman yalnızca bir iç katmana bağımlıdır; dış katmanlar içerideki katmanlara bağlı değildir.

```
┌──────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                   │
│              React SPA (Frontend Container)              │
│                   (Port: 3000 → Nginx)                   │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP / REST / JSON
                         ▼
┌──────────────────────────────────────────────────────────┐
│                    API LAYER (Controller)                 │
│              ASP.NET Core Web API Container              │
│                      (Port: 5000)                        │
│  AuthController │ AdvertController │ OfferController     │
│  UserController │ AdminController  │ ReviewController     │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                      │
│              (Business Logic / Use Cases)                │
│   Services: AdvertService │ OfferService │ UserService   │
│             AuthService   │ ReviewService                │
│   DTOs, Validators, Mappers (AutoMapper)                 │
│   Interfaces (IAdvertRepository, IOfferRepository…)      │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                    DOMAIN LAYER                          │
│                 (Core Business Rules)                    │
│   Entities: User, Advert, Offer, Review, Complaint       │
│   Enums: UserRole, AdvertStatus, OfferStatus             │
│   Domain Events (opsiyonel)                              │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                     │
│         (EF Core, MSSQL, JWT, File Storage…)             │
│   AppDbContext (EF Core)                                 │
│   Repositories: AdvertRepository │ OfferRepository…     │
│   JwtTokenService                                        │
│   MSSQL Container (Port: 1433)                           │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Docker Container Mimarisi

```
┌─────────────────────────────────────────────────────────────────┐
│                    Docker Network: nakliye-net                   │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │   frontend   │    │     api      │    │      mssql       │  │
│  │  (React/     │───▶│  (ASP.NET    │───▶│  (SQL Server     │  │
│  │   Nginx)     │    │   Core 8)    │    │   2022)          │  │
│  │              │    │              │    │                  │  │
│  │  Port: 3000  │    │  Port: 5000  │    │  Port: 1433      │  │
│  │  (host:80)   │    │  (host:5000) │    │  (internal only) │  │
│  └──────────────┘    └──────────────┘    └──────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Docker Volumes                         │   │
│  │  mssql-data  (veritabanı kalıcı verisi)                 │   │
│  │  api-uploads (yüklenen dosyalar/fotoğraflar)            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Veri Akışı — Örnek Senaryo (İlan Oluşturma)

```
Gönderici (Browser)
    │
    │  POST /api/adverts  { token: "JWT..." }
    ▼
React Frontend (Nginx: 80)
    │
    │  Proxy → http://api:5000
    ▼
ASP.NET Core — AdvertController
    │
    │  [Authorize(Roles = "Sender")]
    │  CreateAdvert(CreateAdvertDto dto)
    ▼
AdvertService
    │
    │  Validate → Map DTO → Business Rules
    ▼
AdvertRepository (EF Core)
    │
    │  DbContext.Adverts.Add(advert)
    │  SaveChangesAsync()
    ▼
MSSQL Container
    │
    │  INSERT INTO Adverts ...
    ▼
Response: 201 Created { advertId, status: "Open" }
```

### 2.4 JWT Kimlik Doğrulama Akışı

```
[1] POST /api/auth/login  →  { email, password }
[2] AuthService → BCrypt.Verify(password, hash)
[3] JwtTokenService → Token üret (userId, role, exp: 24h)
[4] Response → { token, role, expiresAt }
[5] Frontend → localStorage'a kaydet
[6] Sonraki istekler → Header: Authorization: Bearer <token>
[7] ASP.NET Core Middleware → JWT doğrula → claim'leri context'e ekle
[8] [Authorize(Roles="...")] attribute → rol kontrolü
```

---

## 3. Docker Altyapısı

### 3.1 `docker-compose.yml`

```yaml
version: "3.9"

services:

  # ─── MSSQL Server ───────────────────────────────────────
  mssql:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: nakliye-mssql
    environment:
      SA_PASSWORD: "Nakliye_Strong@Pass123"
      ACCEPT_EULA: "Y"
      MSSQL_PID: "Developer"
    ports:
      - "1433:1433"          # Geliştirmede DBeaver/SSMS erişimi için
    volumes:
      - mssql-data:/var/opt/mssql
    networks:
      - nakliye-net
    healthcheck:
      test: ["CMD", "/opt/mssql-tools/bin/sqlcmd", "-S", "localhost",
             "-U", "sa", "-P", "Nakliye_Strong@Pass123", "-Q", "SELECT 1"]
      interval: 10s
      retries: 10
      start_period: 30s

  # ─── ASP.NET Core API ───────────────────────────────────
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: nakliye-api
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Server=mssql,1433;Database=NakliyeDb;User Id=sa;Password=Nakliye_Strong@Pass123;TrustServerCertificate=True;
      - JwtSettings__Secret=NakliyeSuperSecretKey_MinimumLength32Chars!
      - JwtSettings__Issuer=NakliyeApp
      - JwtSettings__Audience=NakliyeUsers
      - JwtSettings__ExpireHours=24
    ports:
      - "5000:5000"
    volumes:
      - api-uploads:/app/uploads
    depends_on:
      mssql:
        condition: service_healthy
    networks:
      - nakliye-net

  # ─── React Frontend ─────────────────────────────────────
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: nakliye-frontend
    ports:
      - "80:80"
    depends_on:
      - api
    networks:
      - nakliye-net

volumes:
  mssql-data:
  api-uploads:

networks:
  nakliye-net:
    driver: bridge
```

### 3.2 Backend Dockerfile (`/backend/Dockerfile`)

```dockerfile
# Build aşaması
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY *.sln .
COPY src/NakliyeApp.API/*.csproj            src/NakliyeApp.API/
COPY src/NakliyeApp.Application/*.csproj   src/NakliyeApp.Application/
COPY src/NakliyeApp.Domain/*.csproj        src/NakliyeApp.Domain/
COPY src/NakliyeApp.Infrastructure/*.csproj src/NakliyeApp.Infrastructure/

RUN dotnet restore

COPY . .
RUN dotnet publish src/NakliyeApp.API -c Release -o /app/publish

# Runtime aşaması
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000

ENTRYPOINT ["dotnet", "NakliyeApp.API.dll"]
```

### 3.3 Frontend Dockerfile (`/frontend/Dockerfile`)

```dockerfile
# Build aşaması
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json .
RUN npm ci

COPY . .
RUN npm run build

# Nginx ile servis
FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3.4 Nginx Yapılandırması (`/frontend/nginx.conf`)

```nginx
server {
    listen 80;

    # React SPA — tüm route'ları index.html'e yönlendir
    location / {
        root   /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # API isteklerini backend container'a proxy'le
    location /api/ {
        proxy_pass         http://api:5000;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
    }
}
```

### 3.5 Temel Docker Komutları

```bash
# Tüm servisleri build edip başlat
docker-compose up --build

# Arka planda çalıştır
docker-compose up -d --build

# Logları izle
docker-compose logs -f api
docker-compose logs -f mssql

# Sadece belirli servisi yeniden başlat
docker-compose restart api

# Migration çalıştır (API container içinde)
docker-compose exec api dotnet ef database update

# Durdur ve temizle
docker-compose down

# Veritabanı dahil her şeyi sıfırla
docker-compose down -v
```

---

## 4. Proje Dizin Yapısı

```
nakliye-ilan-sistemi/
│
├── docker-compose.yml
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── NakliyeApp.sln
│   │
│   └── src/
│       ├── NakliyeApp.API/                  ← Controller katmanı
│       │   ├── Controllers/
│       │   │   ├── AuthController.cs
│       │   │   ├── AdvertController.cs
│       │   │   ├── OfferController.cs
│       │   │   ├── ReviewController.cs
│       │   │   ├── UserController.cs
│       │   │   └── AdminController.cs
│       │   ├── Middleware/
│       │   │   └── ExceptionMiddleware.cs
│       │   ├── Program.cs
│       │   └── appsettings.json
│       │
│       ├── NakliyeApp.Application/          ← İş mantığı katmanı
│       │   ├── DTOs/
│       │   │   ├── Auth/
│       │   │   ├── Advert/
│       │   │   ├── Offer/
│       │   │   ├── User/
│       │   │   └── Review/
│       │   ├── Interfaces/
│       │   │   ├── IAdvertRepository.cs
│       │   │   ├── IOfferRepository.cs
│       │   │   ├── IUserRepository.cs
│       │   │   └── IReviewRepository.cs
│       │   ├── Services/
│       │   │   ├── AuthService.cs
│       │   │   ├── AdvertService.cs
│       │   │   ├── OfferService.cs
│       │   │   ├── UserService.cs
│       │   │   └── ReviewService.cs
│       │   └── Mappings/
│       │       └── MappingProfile.cs        ← AutoMapper
│       │
│       ├── NakliyeApp.Domain/               ← Entity'ler ve iş kuralları
│       │   ├── Entities/
│       │   │   ├── User.cs
│       │   │   ├── Advert.cs
│       │   │   ├── Offer.cs
│       │   │   ├── Review.cs
│       │   │   └── Complaint.cs
│       │   └── Enums/
│       │       ├── UserRole.cs
│       │       ├── AdvertStatus.cs
│       │       └── OfferStatus.cs
│       │
│       └── NakliyeApp.Infrastructure/       ← Veri erişim katmanı
│           ├── Data/
│           │   ├── AppDbContext.cs
│           │   └── Migrations/
│           ├── Repositories/
│           │   ├── AdvertRepository.cs
│           │   ├── OfferRepository.cs
│           │   ├── UserRepository.cs
│           │   └── ReviewRepository.cs
│           └── Services/
│               └── JwtTokenService.cs
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.js
    │
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/                             ← Axios instance ve endpoint'ler
        │   ├── axiosInstance.js
        │   ├── authApi.js
        │   ├── advertApi.js
        │   ├── offerApi.js
        │   └── reviewApi.js
        ├── context/
        │   └── AuthContext.jsx              ← Global auth state
        ├── components/
        │   ├── common/                      ← Paylaşımlı bileşenler
        │   │   ├── Navbar.jsx
        │   │   ├── ProtectedRoute.jsx
        │   │   └── LoadingSpinner.jsx
        │   ├── advert/
        │   ├── offer/
        │   └── review/
        └── pages/
            ├── auth/
            │   ├── LoginPage.jsx
            │   └── RegisterPage.jsx
            ├── sender/                      ← Gönderici sayfaları
            │   ├── Dashboard.jsx
            │   ├── AdvertList.jsx
            │   ├── AdvertCreate.jsx
            │   ├── AdvertDetail.jsx
            │   └── OfferList.jsx
            ├── carrier/                     ← Taşıyıcı sayfaları
            │   ├── Dashboard.jsx
            │   ├── OpenAdverts.jsx
            │   ├── MyOffers.jsx
            │   └── ActiveJobs.jsx
            └── admin/                       ← Admin sayfaları
                ├── Dashboard.jsx
                ├── UserManagement.jsx
                ├── AdvertManagement.jsx
                └── Complaints.jsx
```

---

## 5. Veritabanı Şeması

### 5.1 Entity İlişki Diyagramı (Metinsel)

```
Users (1) ──────────────── (N) Adverts
Users (1) ──────────────── (N) Offers
Users (1) ──────────────── (N) Reviews (reviewer olarak)
Users (1) ──────────────── (N) Reviews (reviewed olarak)
Adverts (1) ─────────────── (N) Offers
Adverts (1) ─────────────── (1) Review (tamamlanan iş için)
Users (1) ──────────────── (N) Complaints
```

### 5.2 Tablo Tanımları

#### `Users`
```sql
CREATE TABLE Users (
    Id          INT IDENTITY PRIMARY KEY,
    FirstName   NVARCHAR(100) NOT NULL,
    LastName    NVARCHAR(100) NOT NULL,
    Email       NVARCHAR(255) NOT NULL UNIQUE,
    Phone       NVARCHAR(20),
    PasswordHash NVARCHAR(255) NOT NULL,
    Role        NVARCHAR(20) NOT NULL,        -- Sender | Carrier | Admin
    IsActive    BIT NOT NULL DEFAULT 1,
    CreatedAt   DATETIME2 DEFAULT GETDATE(),

    -- Taşıyıcıya özgü alanlar (NULL = Gönderici veya Admin)
    VehicleType NVARCHAR(50),                 -- Kamyonet, Kamyon, TIR
    City        NVARCHAR(100),
    AverageRating DECIMAL(3,2) DEFAULT 0,
    RatingCount INT DEFAULT 0
);
```

#### `Adverts`
```sql
CREATE TABLE Adverts (
    Id              INT IDENTITY PRIMARY KEY,
    SenderId        INT NOT NULL REFERENCES Users(Id),
    CargoType       NVARCHAR(100) NOT NULL,   -- Ev eşyası, Ticari yük, vb.
    CargoWeight     NVARCHAR(50),
    OriginCity      NVARCHAR(100) NOT NULL,
    OriginDistrict  NVARCHAR(100),
    DestCity        NVARCHAR(100) NOT NULL,
    DestDistrict    NVARCHAR(100),
    TransportDate   DATE NOT NULL,
    Description     NVARCHAR(1000),
    PhotoPath       NVARCHAR(500),            -- Opsiyonel fotoğraf
    Status          NVARCHAR(30) NOT NULL DEFAULT 'Open',
    -- Open | Matched | InProgress | Completed | Cancelled
    CreatedAt       DATETIME2 DEFAULT GETDATE(),
    UpdatedAt       DATETIME2
);
```

#### `Offers`
```sql
CREATE TABLE Offers (
    Id              INT IDENTITY PRIMARY KEY,
    AdvertId        INT NOT NULL REFERENCES Adverts(Id),
    CarrierId       INT NOT NULL REFERENCES Users(Id),
    Price           DECIMAL(10,2) NOT NULL,
    EstimatedDate   DATE,
    Note            NVARCHAR(500),
    Status          NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    -- Pending | Accepted | Rejected
    CreatedAt       DATETIME2 DEFAULT GETDATE()
);
```

#### `Reviews`
```sql
CREATE TABLE Reviews (
    Id          INT IDENTITY PRIMARY KEY,
    AdvertId    INT NOT NULL REFERENCES Adverts(Id),
    ReviewerId  INT NOT NULL REFERENCES Users(Id),   -- Puan veren
    ReviewedId  INT NOT NULL REFERENCES Users(Id),   -- Puan alan
    Rating      TINYINT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment     NVARCHAR(1000),
    CreatedAt   DATETIME2 DEFAULT GETDATE()
);
```

#### `Complaints`
```sql
CREATE TABLE Complaints (
    Id          INT IDENTITY PRIMARY KEY,
    ReporterId  INT NOT NULL REFERENCES Users(Id),
    TargetId    INT REFERENCES Users(Id),
    AdvertId    INT REFERENCES Adverts(Id),
    Description NVARCHAR(1000) NOT NULL,
    Status      NVARCHAR(20) DEFAULT 'Pending',  -- Pending | Resolved | Dismissed
    CreatedAt   DATETIME2 DEFAULT GETDATE()
);
```

---

## 6. Backend — ASP.NET Core API

### 6.1 Temel Entity'ler (C#)

```csharp
// Domain/Entities/User.cs
public class User
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public string PasswordHash { get; set; }
    public UserRole Role { get; set; }          // Enum
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }

    // Taşıyıcı alanları
    public string? VehicleType { get; set; }
    public string? City { get; set; }
    public decimal AverageRating { get; set; }
    public int RatingCount { get; set; }

    // Navigation
    public ICollection<Advert> Adverts { get; set; }
    public ICollection<Offer> Offers { get; set; }
}

// Domain/Enums/UserRole.cs
public enum UserRole { Sender, Carrier, Admin }

// Domain/Enums/AdvertStatus.cs
public enum AdvertStatus { Open, Matched, InProgress, Completed, Cancelled }

// Domain/Enums/OfferStatus.cs
public enum OfferStatus { Pending, Accepted, Rejected }
```

### 6.2 Program.cs Yapılandırması

```csharp
var builder = WebApplication.CreateBuilder(args);

// EF Core + MSSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Authentication
var jwt = builder.Configuration.GetSection("JwtSettings");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuer = true,
            ValidIssuer = jwt["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwt["Audience"],
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwt["Secret"]))
        };
    });

// Role-based Authorization
builder.Services.AddAuthorization(options => {
    options.AddPolicy("SenderOnly",  p => p.RequireRole("Sender"));
    options.AddPolicy("CarrierOnly", p => p.RequireRole("Carrier"));
    options.AddPolicy("AdminOnly",   p => p.RequireRole("Admin"));
});

// Dependency Injection
builder.Services.AddScoped<IAdvertRepository, AdvertRepository>();
builder.Services.AddScoped<IOfferRepository, OfferRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<AdvertService>();
builder.Services.AddScoped<OfferService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ReviewService>();
builder.Services.AddScoped<JwtTokenService>();

// AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// CORS — Frontend container'a izin ver
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", p =>
        p.WithOrigins("http://localhost", "http://localhost:3000")
         .AllowAnyHeader()
         .AllowAnyMethod());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Auto-migration (Docker başladığında)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
```

### 6.3 Katmanlı Repository Pattern

```csharp
// Application/Interfaces/IAdvertRepository.cs
public interface IAdvertRepository
{
    Task<Advert?> GetByIdAsync(int id);
    Task<IEnumerable<Advert>> GetOpenAdvertsAsync(AdvertFilterDto filter);
    Task<IEnumerable<Advert>> GetByUserIdAsync(int userId);
    Task<Advert> CreateAsync(Advert advert);
    Task UpdateAsync(Advert advert);
    Task DeleteAsync(int id);
}

// Infrastructure/Repositories/AdvertRepository.cs
public class AdvertRepository : IAdvertRepository
{
    private readonly AppDbContext _db;
    public AdvertRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<Advert>> GetOpenAdvertsAsync(AdvertFilterDto filter)
    {
        var query = _db.Adverts
            .Where(a => a.Status == AdvertStatus.Open)
            .AsQueryable();

        if (!string.IsNullOrEmpty(filter.City))
            query = query.Where(a => a.OriginCity == filter.City || a.DestCity == filter.City);

        if (filter.TransportDate.HasValue)
            query = query.Where(a => a.TransportDate == filter.TransportDate);

        if (!string.IsNullOrEmpty(filter.CargoType))
            query = query.Where(a => a.CargoType == filter.CargoType);

        return await query.Include(a => a.Sender).ToListAsync();
    }
    // ...
}
```

---

## 7. Frontend — React

### 7.1 Axios Instance ve Interceptor

```javascript
// src/api/axiosInstance.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',   // Nginx proxy üzerinden API'ye yönlendirilir
  timeout: 10000,
});

// Her isteğe otomatik JWT token ekle
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 gelirse logout yap
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
```

### 7.2 Auth Context

```jsx
// src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### 7.3 Protected Route

```jsx
// src/components/common/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" />;

  return children;
}
```

### 7.4 App.jsx — Route Yapısı

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Gönderici */}
        <Route path="/sender" element={
          <ProtectedRoute allowedRoles={['Sender']}>
            <SenderLayout />
          </ProtectedRoute>
        }>
          <Route index             element={<SenderDashboard />} />
          <Route path="adverts"    element={<AdvertList />} />
          <Route path="adverts/new" element={<AdvertCreate />} />
          <Route path="adverts/:id" element={<AdvertDetail />} />
        </Route>

        {/* Taşıyıcı */}
        <Route path="/carrier" element={
          <ProtectedRoute allowedRoles={['Carrier']}>
            <CarrierLayout />
          </ProtectedRoute>
        }>
          <Route index              element={<CarrierDashboard />} />
          <Route path="open-adverts" element={<OpenAdverts />} />
          <Route path="my-offers"    element={<MyOffers />} />
          <Route path="active-jobs"  element={<ActiveJobs />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index        element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="adverts" element={<AdvertManagement />} />
          <Route path="complaints" element={<Complaints />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 8. Modüller ve Geliştirme Sırası

### Modül 1 — Auth & Kullanıcı Sistemi
- [ ] User entity ve migration
- [ ] Register endpoint (Sender / Carrier)
- [ ] Login endpoint + JWT üretimi
- [ ] Password hash (BCrypt)
- [ ] Login sayfası (React)
- [ ] Register sayfası (React)
- [ ] AuthContext + token yönetimi
- [ ] ProtectedRoute bileşeni

### Modül 2 — İlan Yönetimi (Gönderici)
- [ ] Advert entity ve migration
- [ ] POST /api/adverts — ilan oluştur
- [ ] GET /api/adverts/my — kendi ilanlarım
- [ ] GET /api/adverts/:id — ilan detayı
- [ ] PUT /api/adverts/:id — ilan güncelle
- [ ] DELETE /api/adverts/:id — ilan sil
- [ ] Gönderici Dashboard (React)
- [ ] İlan oluşturma formu (React)
- [ ] İlan listesi ve detay sayfası (React)

### Modül 3 — İlan Listeleme (Taşıyıcı)
- [ ] GET /api/adverts/open — açık ilanlar (filtreleme)
- [ ] Filtreleme: şehir, tarih, yük türü
- [ ] Taşıyıcı Dashboard (React)
- [ ] Açık ilanlar sayfası + filtreler (React)

### Modül 4 — Teklif Yönetimi
- [ ] Offer entity ve migration
- [ ] POST /api/offers — teklif ver
- [ ] GET /api/adverts/:id/offers — ilana gelen teklifler
- [ ] PUT /api/offers/:id/accept — teklif kabul et
- [ ] PUT /api/offers/:id/reject — teklif reddet
- [ ] GET /api/offers/my — verdiğim teklifler
- [ ] İlanın teklif listesi (Gönderici — React)
- [ ] Teklif verme formu (Taşıyıcı — React)
- [ ] Verilen tekliflerim sayfası (Taşıyıcı — React)

### Modül 5 — Taşıma Süreci Takibi
- [ ] Advert Status güncelleme: Matched → InProgress → Completed
- [ ] PUT /api/adverts/:id/status — durum güncelle (Taşıyıcı)
- [ ] Aktif işlerim sayfası (Taşıyıcı — React)
- [ ] İlan detayında taşıma durumu gösterimi (Gönderici — React)

### Modül 6 — Değerlendirme Sistemi
- [ ] Review entity ve migration
- [ ] POST /api/reviews — puan ve yorum bırak
- [ ] GET /api/users/:id/reviews — kullanıcı yorumları
- [ ] Ortalama puan hesaplama (trigger veya service)
- [ ] Taşıma sonrası değerlendirme formu (React)

### Modül 7 — Admin Paneli
- [ ] GET /api/admin/users — tüm kullanıcılar
- [ ] PUT /api/admin/users/:id/toggle — aktif/pasif
- [ ] GET /api/admin/adverts — tüm ilanlar
- [ ] DELETE /api/admin/adverts/:id — ilan sil
- [ ] GET /api/admin/complaints — şikayetler
- [ ] Admin sayfaları (React)

---

## 9. API Endpoint Listesi

### Auth
| Method | Endpoint | Açıklama | Yetki |
|---|---|---|---|
| POST | /api/auth/register | Kayıt ol | Public |
| POST | /api/auth/login | Giriş yap | Public |

### Adverts
| Method | Endpoint | Açıklama | Yetki |
|---|---|---|---|
| GET | /api/adverts/open | Açık ilanları listele (filtreli) | Carrier |
| GET | /api/adverts/my | Kendi ilanlarım | Sender |
| GET | /api/adverts/{id} | İlan detayı | Auth |
| POST | /api/adverts | İlan oluştur | Sender |
| PUT | /api/adverts/{id} | İlan güncelle | Sender |
| DELETE | /api/adverts/{id} | İlan sil | Sender |
| PUT | /api/adverts/{id}/status | Taşıma durumu güncelle | Carrier |

### Offers
| Method | Endpoint | Açıklama | Yetki |
|---|---|---|---|
| GET | /api/adverts/{id}/offers | İlana gelen teklifler | Sender |
| POST | /api/offers | Teklif ver | Carrier |
| GET | /api/offers/my | Verdiğim teklifler | Carrier |
| PUT | /api/offers/{id}/accept | Teklifi kabul et | Sender |
| PUT | /api/offers/{id}/reject | Teklifi reddet | Sender |

### Reviews
| Method | Endpoint | Açıklama | Yetki |
|---|---|---|---|
| POST | /api/reviews | Puan ve yorum bırak | Auth |
| GET | /api/users/{id}/reviews | Kullanıcı yorumları | Auth |

### Admin
| Method | Endpoint | Açıklama | Yetki |
|---|---|---|---|
| GET | /api/admin/users | Tüm kullanıcılar | Admin |
| PUT | /api/admin/users/{id}/toggle | Aktif/pasif yap | Admin |
| GET | /api/admin/adverts | Tüm ilanlar | Admin |
| DELETE | /api/admin/adverts/{id} | İlan sil | Admin |
| GET | /api/admin/complaints | Şikayetler | Admin |
| PUT | /api/admin/complaints/{id}/resolve | Şikayet çözüldü | Admin |

---

## 10. Güvenlik Tasarımı

### 10.1 Katmanlar

```
[1] Transport Security
    → Docker internal network (MSSQL dışarıya kapalı)
    → Nginx reverse proxy

[2] Authentication
    → JWT Bearer Token (24 saat geçerli)
    → BCrypt password hashing (work factor: 12)

[3] Authorization
    → Role-based: [Authorize(Roles = "Sender|Carrier|Admin")]
    → Resource-based: Kullanıcı yalnızca kendi ilanını güncelleyebilir

[4] Input Validation
    → FluentValidation ile DTO doğrulama
    → EF Core parametrized queries (SQL Injection koruması)

[5] Business Rules
    → Gönderici başkasının ilanına erişemez
    → Taşıyıcı kendi teklifini kabul edemez
    → Tamamlanmamış işe yorum bırakılamaz
```

### 10.2 Ortam Değişkenleri (`.env.example`)

```env
# MSSQL
SA_PASSWORD=YourStrong@Pass123

# JWT
JWT_SECRET=MinimumLength32CharacterSecretKey!
JWT_EXPIRE_HOURS=24

# API URL (Frontend için)
VITE_API_BASE_URL=/api
```

> ⚠️ `.env` dosyasını `.gitignore`'a ekle, `docker-compose.yml`'de referans ver.

---

## 11. Geliştirme Aşamaları (Sprint Planı)

### Sprint 1 — Temel Altyapı (1. Hafta)
- [ ] Docker Compose ayarla, tüm containerlar ayağa kaldır
- [ ] MSSQL bağlantısını doğrula
- [ ] ASP.NET Core projesi oluştur (Clean Architecture)
- [ ] EF Core + ilk migration (Users tablosu)
- [ ] JWT Auth endpoint'leri (register/login)
- [ ] React projesi oluştur (Vite)
- [ ] Axios instance + AuthContext
- [ ] Login ve Register sayfaları

### Sprint 2 — İlan Sistemi (2. Hafta)
- [ ] Advert entity + migration
- [ ] CRUD endpoint'leri
- [ ] Gönderici ilan sayfaları
- [ ] Taşıyıcı açık ilanlar + filtreler

### Sprint 3 — Teklif ve Eşleştirme (3. Hafta)
- [ ] Offer entity + migration
- [ ] Teklif endpoint'leri
- [ ] Teklif kabul/ret
- [ ] Taşıma durumu güncelleme
- [ ] İlgili React sayfaları

### Sprint 4 — Değerlendirme + Admin (4. Hafta)
- [ ] Review entity + migration
- [ ] Puanlama endpoint'leri
- [ ] Admin paneli (kullanıcı, ilan, şikayet)
- [ ] Genel testler + hata düzeltmeleri

---

> **Claude Code'da Kullanım:**
> Claude Code terminalinde projeyi açtıktan sonra bu dökümanı referans alarak her sprint'i sırayla Claude Code'a yaptırabilirsin. Örneğin:
> ```
> "Sprint 1'i başlat. Docker Compose dosyasını oluştur ve ASP.NET Core projesini Clean Architecture'a göre kur."
> ```
