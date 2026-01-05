# WebGL2 Game Engine - İlerleme Raporu

**Tarih:** 5 Ocak 2026
**Oturum:** Gün 1
**Teslim:** 7 Ocak 2026, 23:59

---

## 📊 Bugünkü İlerleme (3/15 Commit Tamamlandı)

### ✅ Tamamlanan Commitler

#### Commit 1: Proje Setup ✅
**Dosyalar:**
- `package.json`, `tsconfig.json`, `vite.config.ts`
- `eslint.config.js` (harsch-frontend'den adapte edildi)
- `index.html`, `.gitignore`, `README.md`
- Boş `src/main.ts` ile dev server testi

**Sonuç:**
- ✅ Vite + TypeScript projesi başarıyla kuruldu
- ✅ npm install başarılı (119 paket)
- ✅ ESLint strict kurallar (strictTypeChecked, unused-imports)
- ✅ Dev server çalışıyor (http://localhost:5173)
- ✅ TypeScript compilation geçiyor

---

#### Commit 2: WebGL Context & Basic Shaders ✅
**Dosyalar:**
- `src/utils/GLUtils.ts` - Shader compilation, program linking
- `src/engine/Shader.ts` - Shader class (uniform/attribute caching)
- `src/engine/WebGLRenderer.ts` - Renderer (depth test, culling)
- `src/shaders/basic.ts` - Basic vertex/fragment shaders
- `src/main.ts` - Renkli üçgen render

**Sonuç:**
- ✅ WebGL2 context başarıyla oluşturuldu
- ✅ Shader compilation ve linking çalışıyor
- ✅ VAO (Vertex Array Object) kullanımı
- ✅ Renkli üçgen ekranda görünüyor (kırmızı/yeşil/mavi)
- ✅ Backface culling doğru çalışıyor

---

#### Commit 3: Camera System ✅
**Dosyalar:**
- `src/engine/Camera.ts` - Perspective camera (FOV, aspect, near/far)
- `src/engine/Transform.ts` - Position, rotation, scale + model matrix
- `src/shaders/mvp.ts` - MVP matrix shaders
- `src/main.ts` güncellendi - Rotating triangle

**Sonuç:**
- ✅ gl-matrix entegrasyonu başarılı
- ✅ Perspective projection çalışıyor
- ✅ View matrix (lookAt) çalışıyor
- ✅ MVP matrix pipeline doğru
- ✅ Transform animasyonu (Y-axis rotation)
- ✅ Window resize → camera aspect ratio güncelleniyor

---

## 🎯 Kalan İş (12/15 Commit)

### Yarın (Gün 2) - Hedef: Commit 4-12

#### Commit 4: Cube Geometry 🔄 SONRAKI
- `src/geometry/Geometry.ts` - Base class
- `src/geometry/Cube.ts` - Procedural cube
- `src/geometry/Mesh.ts` - Geometry + Material + Transform
- Test: Rotating cube with lighting

#### Commit 5: Blinn-Phong Shaders (Ambient + Diffuse)
- `src/shaders/phong.vert.glsl`
- `src/shaders/phong.frag.glsl`
- `src/lighting/Light.ts`
- `src/lighting/DirectionalLight.ts`

#### Commit 6: Specular Lighting & Point Light
- Point light + attenuation
- Blinn-Phong halfway vector

#### Commit 7: Sphere Geometry
- UV Sphere (latitude/longitude grid)

#### Commit 8: Cylinder & Prism
- Procedural cylinder (caps + sides)
- Triangular/hexagonal prism

#### Commit 9: Texture System
- `src/loaders/TextureLoader.ts`
- `src/materials/Material.ts`
- `src/materials/PhongMaterial.ts`
- Shader updates for texture sampling

#### Commit 10: OBJ Model Loader
- `src/loaders/OBJLoader.ts`
- Parse vertex positions, normals, UVs, faces
- Test with external model (Suzanne)

#### Commit 11: Scene Graph
- `src/engine/Scene.ts`
- Add/remove objects
- Render multiple objects

#### Commit 12: UI with lil-gui
- `src/ui/SceneUI.ts`
- Add objects via GUI
- Transform controls
- Light controls

### Gün 3 - Hedef: Commit 13-15 (Bonus + Polish)

#### Commit 13: First Person Controller (Bonus +25)
- `src/controllers/FirstPersonController.ts`
- WASD movement + Mouse look

#### Commit 14: Dual Viewport (Bonus +25)
- Engine view + Camera view
- Viewport scissoring

#### Commit 15: Polish & Cleanup
- Code review
- Comments
- README update
- Final testing

---

## 📚 Öğrenilen Dersler & Tecrübeler

### 1. TypeScript Type Safety Challenges

**Sorun:** gl-matrix'in `mat4` tipi TypeScript'te `ReadonlyMat4` olarak döner, `Float32Array` değil.

**Çözüm:** 
```typescript
import { ReadonlyMat4 } from 'gl-matrix';
setMat4(name: string, matrix: ReadonlyMat4): void
```

**Ders:** Type casting yerine library'nin native tiplerini kullan. Zod gibi runtime validation burada gereksiz (internal types için overhead).

---

### 2. TypeScript Type Narrowing

**Sorun:** Canvas `getElementById` sonrası `HTMLElement | null` döner, `HTMLCanvasElement` değil.

**İlk Çözüm (Hatalı):**
```typescript
if (!(canvas instanceof HTMLCanvasElement)) throw Error;
// Ama sonra fonksiyonda type narrowing kayboluyordu
```

**Doğru Çözüm:**
```typescript
if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Canvas element not found');
}
const typedCanvas = canvas; // Type narrowed
function resizeCanvas(): void {
  typedCanvas.width = window.innerWidth; // ✅ Works
}
```

**Ders:** Type narrowing fonksiyon scope'unda kaybolabilir. Typed variable oluştur.

---

### 3. ESLint Strict Rules

**Sorun:** `camera was used before it was defined` hatası.

**Sebep:** `resizeCanvas()` fonksiyonunda `camera.setAspect()` çağrılıyor ama `camera` henüz tanımlanmamış.

**Çözüm:** Dependency order'ı düzelt - önce `camera` oluştur, sonra `resizeCanvas` tanımla.

**Ders:** ESLint strict rules gerçekten runtime bug'ları yakalıyor. Harsch-frontend kuralları çok değerli.

---

### 4. Vite Scaffold vs Manual Setup

**Deney:** `npm create vite@latest . -- --template vanilla-ts` dizin boş değilse cancel oluyor.

**Sonuç:** Manuel setup yaptım (package.json, tsconfig.json, vite.config.ts).

**Ders:** Boş dizinde scaffold kullan, yoksa manuel setup daha hızlı.

---

### 5. GLSL Shader Version

**Dikkat:** WebGL 2.0 için `#version 300 es` kullan.

**Fark:**
- WebGL 1.0: `attribute`, `varying`, `gl_FragColor`
- WebGL 2.0: `in`, `out`, custom `out vec4 fragColor`

**Ders:** Modern GLSL syntax WebGL2'de daha temiz.

---

### 6. Face Culling Behavior

**Gözlem:** Üçgen arkasını dönünce görünmüyor.

**Sebep:** `WebGLRenderer` constructor'da `gl.enable(gl.CULL_FACE)` aktif.

**Davranış:** Counter-clockwise (CCW) winding order = front face. Clockwise = back face (culled).

**Ders:** Single-sided geometri için normal. Cube gibi closed mesh'lerde her face doğru yöne bakacak.

---

### 7. Git Workflow

**Başarı:** Her commit anlamlı ve atomic.
- Commit 1: Setup
- Commit 2: Basic rendering
- Commit 3: Camera system

**Ders:** Küçük, test edilebilir commitler çok daha iyi. Her commit test edildi, type-check geçti.

---

### 8. gl-matrix Performans

**Kullanım:** 
- `mat4.create()` - Yeni matrix oluştur
- `mat4.translate()`, `mat4.rotate()`, `mat4.scale()` - In-place operations

**Ders:** gl-matrix optimize edilmiş, her frame yeni matris oluşturmak problem değil (cache-friendly).

---

## ⚠️ Dikkat Edilmesi Gerekenler

### Zaman Yönetimi
- **Şu an:** 3/15 commit (20% tamamlandı)
- **Kalan süre:** 2 gün
- **Hedef:** Yarın 9 commit, son gün 3 commit + bonus

### Kritik Öncelikler
1. **Core features önce** - Bonus'lar opsiyonel
2. **Test her commit** - Browser'da visual verification
3. **Type-check her seferinde** - Runtime hataları önle

### Risk Alanları
- **OBJ Loader:** Parsing karmaşık olabilir → Basit formatla başla
- **Dual Viewport:** Viewport scissoring tricky olabilir → Fallback: iki canvas
- **Texture Loading:** Async operations → Promise handling dikkatli

---

## 🚀 Sonraki Oturum İçin Notlar

### Başlangıç Checklist
1. ✅ `npm run dev` - Dev server başlat
2. ✅ Browser aç (http://localhost:5173)
3. ✅ Terminal'de `git log --oneline` - Son commit kontrol
4. ✅ `task.md` aç - Nereden devam edeceğini gör

### Commit 4 Hazırlıkları
**Cube Geometry** için gerekli:
- [ ] `Geometry` base class (VAO, VBO, IBO management)
- [ ] Cube vertex calculation (8 vertices, 36 indices - 12 triangles)
- [ ] Per-face normals (6 yüz için)
- [ ] UV coordinates (texture mapping için)
- [ ] `Mesh` class (Geometry + Transform birleştir)

**Test Planı:**
- Rotating cube render edilecek
- Her face farklı renk olabilir (debugging için)
- Backface culling testi

---

## 📈 İlerleme Grafiği

```
Gün 1 (Bugün)    [███░░░░░░░░░░░░] 20% (3/15 commit)
Gün 2 (Yarın)    [░░░░░░░░░░░░░░░] Hedef: 80% (12/15)
Gün 3 (Son Gün)  [░░░░░░░░░░░░░░░] Hedef: 100% + Bonus
```

---

## 💡 Motivasyon

**Başarılar:**
- ✅ Proje başarıyla kuruldu
- ✅ WebGL pipeline çalışıyor
- ✅ Camera sistemi implement edildi
- ✅ Type-safe kod yazılıyor
- ✅ Her commit test edildi ve geçti

**Momentum:** İlk 3 commit sorunsuz tamamlandı. Temel altyapı sağlam. Yarın geometri ve lighting'e odaklanacağız!

---

## 📝 Teknik Stack Özeti

**Build & Dev:**
- Vite 6.3.5
- TypeScript 5.8.3
- ESLint (strictTypeChecked)

**Core Libraries:**
- gl-matrix 3.4.3 (linear algebra)
- lil-gui 0.19.0 (UI - henüz kullanılmadı)

**Custom Engine:**
- WebGLRenderer
- Shader (with caching)
- Camera (Perspective)
- Transform (MVP matrices)

**Next Up:**
- Geometry system
- Lighting (Blinn-Phong)
- Texture loading
- OBJ parser

---

**Yarın görüşürüz! 🎮**
