import { useState, useMemo, useCallback, useEffect } from "react";
import { langContext } from "../context/LangContext";
import { changeLanguage } from "../utils/i18n";

export default function LangProvider({ children }) {
  const [lang, setLang] = useState("ru");

  const changeLang = useCallback((langCode) => {
    changeLanguage(langCode);
    setLang(langCode);
  }, []);

  useEffect(() => {
    if (localStorage.getItem("lang")) {
      setLang(localStorage.getItem("lang"));
    }
  }, []);

  const value = useMemo(() => ({ lang, changeLang }), [lang, changeLang]);

  // @ts-ignore
  return <langContext.Provider value={value}>{children}</langContext.Provider>;
}
