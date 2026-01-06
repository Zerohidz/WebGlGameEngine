# WebGL2 Game Engine - Teknik Kararlar

## 📋 Proje Bilgileri

- **Proje Adı:** WebGL2 Mini Game Engine
- **Teslim Tarihi:** 7 Ocak 2026, 23:59
- **Süre:** 3 gün
- **Hedef:** Core features (100 puan) + Bonus features (50 puan)

---

## ✅ Alınan Teknik Kararlar

### 1. Kapsam Kararları

#### Core Features (100 Puan)
- ✅ Geometry Generation: Cube, Sphere (UV Sphere), Cylinder, Prism
- ✅ External Model Loading: OBJ format
- ✅ Texture Mapping: Albedo/diffuse maps, UV coordinates
- ✅ Lighting System: Blinn-Phong model (Directional + Point Light)
- ✅ Perspective Camera: Controllable camera
- ✅ Scene Graph & UI: Object management, transforms, light controls

#### Bonus Features (+50 Puan)
- ✅ Advanced Camera Controller (+25): First Person Controller (WASD + Mouse Look)
- [ ] Dual Viewports (+25): Engine View + Camera View (Next Priority)

### 2. Teknoloji Yığını

#### Frontend Framework
- **Vite** - Build tool & dev server (scaffold via `npm create vite@latest`)
- **TypeScript** - Type-safe development
- **No React** - Vanilla TypeScript only
  - **Reason:** WebGL is imperative API, React's declarative virtual DOM model creates unnecessary overhead
  - **Reason:** requestAnimationFrame loop conflicts with React re-render cycle
  - **Reason:** Minimal DOM (only canvas), no need for component framework
- **Workflow:** Similar to harsch-frontend structure but without React layer

#### Allowed Libraries
- **gl-matrix (^3.4.3)** - Linear algebra operations (Matrix, Vector math)
- **lil-gui (^0.19.0)** - Lightweight GUI library
- **vite-plugin-glsl** - GLSL shader import support

#### Forbidden Libraries
- ❌ Three.js, Babylon.js, A-Frame (High-level 3D libraries)
- ❌ Any other rendering abstraction library

### 3. Implementation Choices

#### Geometry
- **Sphere Type:** UV Sphere
  - **Reason:** Daha kolay implement edilir
  - **Trade-off:** Polar singularity var ama texture distortion büyük sorun değil
  
#### Model Format
- **Format:** OBJ (Wavefront)
  - **Reason:** Basit, text-based, parse etmesi kolay
  - **Alternative:** GLTF daha modern ama daha kompleks

#### Lighting Model
- **Model:** Blinn-Phong
  - **Reason:** Phong'a göre biraz daha accurate specular highlights
  - **Components:** Ambient + Diffuse + Specular
  - **Light Types:** Directional Light + Point Light (with attenuation)

#### Camera Controller (Bonus)
- **Type:** First Person Controller
  - **Controls:** WASD movement + Mouse look
  - **Reason:** Third Person'a göre daha kolay implement edilir

---

## 🏗️ Proje Yapısı

```
webgl-game-engine/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
├── TECHNICAL_DECISIONS.md      # Bu dosya
├── IMPLEMENTATION_PLAN.md      # Detaylı tasarım dokümanı
├── public/
│   ├── models/                 # .obj files
│   │   └── example.obj
│   └── textures/               # texture images
│       └── example.png
└── src/
    ├── main.ts                 # Entry point
    ├── engine/                 # Core engine classes
    │   ├── WebGLRenderer.ts
    │   ├── Shader.ts
    │   ├── Camera.ts
    │   ├── Scene.ts
    │   └── Transform.ts
    ├── geometry/               # Primitive shapes
    │   ├── Geometry.ts         # Base class
    │   ├── Cube.ts
    │   ├── Sphere.ts
    │   ├── Cylinder.ts
    │   ├── Prism.ts
    │   └── Mesh.ts
    ├── loaders/                # Resource loaders
    │   ├── OBJLoader.ts
    │   └── TextureLoader.ts
    ├── lighting/               # Light system
    │   ├── Light.ts            # Base class
    │   ├── DirectionalLight.ts
    │   └── PointLight.ts
    ├── materials/              # Materials & shaders
    │   ├── Material.ts
    │   └── PhongMaterial.ts
    ├── controllers/            # Camera controllers
    │   └── FirstPersonController.ts
    ├── shaders/                # GLSL shaders
    │   ├── phong.vert.glsl
    │   └── phong.frag.glsl
    ├── ui/                     # GUI implementation
    │   └── SceneUI.ts
    └── utils/                  # Helper utilities
        ├── GLUtils.ts
        └── MathUtils.ts
```

---

## 🎯 Tasarım Prensipleri

### 1. Modülerlik
- Her component bağımsız olarak test edilebilir olmalı
- Clear separation of concerns
- Single Responsibility Principle

### 2. Type Safety
- Full TypeScript usage
- Strict type checking
- Interface-driven design

### 3. Performance
- Minimize WebGL state changes
- Efficient buffer management
- Use of VAOs (Vertex Array Objects)

### 4. Code Quality
- Clean, readable code
- Meaningful variable/function names
- Comprehensive comments for complex algorithms

---

## 🚀 Development Workflow

### Setup
```bash
npm create vite@latest . -- --template vanilla-ts  # Scaffold project
npm install gl-matrix lil-gui vite-plugin-glsl
npm install -D eslint typescript-eslint eslint-plugin-unused-imports
```

### Commands
```bash
yarn install          # Install dependencies
yarn dev          # Start dev server (localhost:5173)
yarn build        # Production build
yarn preview      # Preview production build
yarn type-check   # TypeScript type checking
```

### Testing Strategy
Her commit sonrası:
1. Visual testing (browser'da çalıştır)
2. Console'da error kontrolü
3. TypeScript compilation check
4. Manuel functionality testing

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "gl-matrix": "^3.4.3",
    "lil-gui": "^0.19.0",
    "vite-plugin-glsl": "^1.3.0"
  },
  "devDependencies": {
    "vite": "^6.3.5",
    "typescript": "^5.8.3",
    "eslint": "^9.17.0",
    "typescript-eslint": "^8.39.0",
    "eslint-plugin-unused-imports": "^4.1.4"
  }
}
```

### ESLint Configuration

ESLint rules adapted from harsch-frontend project:
- **strictTypeChecked** - Maximum type safety
- **unused-imports** - Auto-remove unused imports
- **no-floating-promises** - Catch unhandled promises
- **consistent-type-assertions** - Never use `as` assertions
- **restrict-template-expressions** - Type-safe template literals

React-specific rules removed (react-hooks, react-refresh).

---

## ⚠️ Kısıtlamalar ve Uyarılar

### Academic Integrity
- ✅ Tüm kod orijinal olmalı
- ✅ Web'den alınan code snippet'ler yasak
- ✅ gl-matrix ve lil-gui hariç 3rd party library yasak
- ✅ Algoritmaları kendimiz implement etmeliyiz

### Time Constraints
- **Toplam süre:** 3 gün
- **Milestone-based development:** Her feature incremental olarak eklenecek
- **Test-driven:** Her ekleme sonrası test edilecek

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Edge)
- WebGL 2.0 support required
- No plugins needed

---

## 📝 Next Steps

1. ✅ Teknik kararlar dokümante edildi
2. 🔄 Detaylı implementation planı oluşturulacak
3. ⏳ Commit-by-commit breakdown hazırlanacak
4. ⏳ User approval alınacak
5. ⏳ Implementation başlayacak
