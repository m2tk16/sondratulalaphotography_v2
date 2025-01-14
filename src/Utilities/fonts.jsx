import { useEffect } from "react";
import SacramentoFont from "webfontloader";

const SacFont = () => {
  useEffect(() => {
    SacramentoFont.load({
      google: {
        families: ["Sacramento"],
      },
    });
  }, []);
};

export default SacFont;
