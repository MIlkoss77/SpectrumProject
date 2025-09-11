import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "../locales/en/common.json";
import es from "../locales/es/common.json";
import pt from "../locales/pt/common.json";
import ru from "../locales/ru/common.json";

const resources = { en: { translation: en }, es: { translation: es }, pt: { translation: pt }, ru: { translation: ru } };

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: { order: ['querystring','localStorage','navigator'], caches: ['localStorage'] }
  });

export default i18n;
