import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ru from "../locales/ru.json";
import uz from "../locales/uz.json";
import cryl from "../locales/cryl.json";

const resources = {
  ru: {
    translation: ru,
  },
  uz: {
    translation: uz,
  },
  cryl: {
    translation: cryl,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "ru",
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
export const { t, changeLanguage, language } = i18n;
