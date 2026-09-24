/**
 * Versions Data Layer
 * ====================
 * Fuente de datos centralizada. Generado automáticamente desde GitHub Releases.
 * Para cambiar la fuente (JSON local, GitHub Releases API),
 * solo modifica las funciones dentro de VersionService.
 * La UI nunca accede directamente a VERSIONS.
 */

const VERSIONS = [
  {
    version: "1.2.2",
    build: null,
    date: "2026-09-24",
    size: "70.9 MB",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    url: "https://github.com/HeidyVivas/Qr_Lichen-Dreams/releases/download/v1.2.2/Lichen_Dreams_v1.2.2.apk",
    changelog: []
  },
  {
    version: "1.2.1",
    build: null,
    date: "2026-09-24",
    size: "71.1 MB",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    url: "https://github.com/HeidyVivas/Qr_Lichen-Dreams/releases/download/v1.2.1/Lichen_Dreams_v1.2.1.apk",
    changelog: []
  },
  {
    version: "1.2.0",
    build: 3,
    date: "2026-09-21",
    size: "71.1 MB",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    url: "https://github.com/HeidyVivas/Qr_Lichen-Dreams/releases/download/v1.2.0/Lichen_Dreams_v1.2.0.apk",
    changelog: [
      "Mejoras en la cámara y control de zoom.",
      "Mejoras de estabilidad y rendimiento.",
      "Correcciones generales.",
      "Mejoras en la experiencia de usuario."
    ]
  },
  {
    version: "1.1.0",
    build: null,
    date: "2026-09-21",
    size: "72.3 MB",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    url: "https://github.com/HeidyVivas/Qr_Lichen-Dreams/releases/download/v1.1.0/Lichen_Dreams_v1.1.0.apk",
    changelog: [
      "Mejoras y correcciones generales.",
      "Mejoras de estabilidad y rendimiento.",
      "Mejoras en la experiencia de usuario."
    ]
  },
  {
    version: "1.0.3",
    build: null,
    date: "2026-09-21",
    size: "72.2 MB",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    url: "https://github.com/HeidyVivas/Qr_Lichen-Dreams/releases/download/v1.0.3/Lichen_Dreams_v1.0.3.apk",
    changelog: [
      "Mejoras y correcciones generales.",
      "Mejoras de estabilidad de la aplicación."
    ]
  },
  {
    version: "1.0.2",
    build: null,
    date: "2026-09-21",
    size: "72.0 MB",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    url: "https://github.com/HeidyVivas/Qr_Lichen-Dreams/releases/download/v1.0.2/Lichen_Dreams_v1.0.2.apk",
    changelog: [
      "Mejoras y correcciones generales.",
      "Mejoras de estabilidad de la aplicación."
    ]
  },
  {
    version: "1.0.1",
    build: null,
    date: "2026-09-21",
    size: "71.7 MB",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    url: "https://github.com/HeidyVivas/Qr_Lichen-Dreams/releases/download/v1.0.1/Lichen_Dreams_v1.0.1.apk",
    changelog: [
      "Mejoras y correcciones generales.",
      "Mejoras de estabilidad de la aplicación."
    ]
  },
  {
    version: "1.0.0",
    build: null,
    date: "2026-09-21",
    size: "71.7 MB",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    url: "https://github.com/HeidyVivas/Qr_Lichen-Dreams/releases/download/v1.0.0/Lichen_Dreams_v1.0.0.apk",
    changelog: [
      "Primera versión de Lichen Dreams disponible para Android"
    ]
  }
];


const VersionService = {
  async getVersions() { return VERSIONS; },
  async getLatest() { return VERSIONS.length > 0 ? VERSIONS[0] : null; },
  async getByVersion(name) { return VERSIONS.find(v => v.version === name) || null; },
  async getPrevious() { return VERSIONS.slice(1); },
  async getDownloadUrl(name) { const v = await this.getByVersion(name); return v ? v.url : null; }
};
