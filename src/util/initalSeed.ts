import User from "../models/user";
import db from "./db";
import { hash } from "bcryptjs";

interface Options {
  isTesting?: boolean;
}

export default async (options?: Options) => {
  return db({ isTesting: !!options?.isTesting })
    .sync({ force: true })
    .then(async () => {
      const passwordHash = await hash("wlodzimierzbialy123", 12);
      if (!passwordHash) {
        throw new Error("password hash error");
      }
      const user = await User.create({
        username: "admin",
        email: "admin@admin.pl",
        passwordHash,
        isAdmin: true,
      });
      const secondPasswordHash = await hash("jeremiaszruzowy321", 12);
      if (!secondPasswordHash) {
        throw new Error("password hash error");
      }
      const secondUser = await User.create({
        username: "not admin",
        email: "test@test.pl",
        passwordHash,
      });
      const firstSuggestion = await secondUser.$create("suggestion", {
        isNew: true,
        isFamily: true,
        name: "krzyżakowats",
        latinName: "testtest",
        appearanceDesc:
          "majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krpie majom <br/>krzyz upie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na majomrzyz na dupie majo",
        behaviorDesc: "robią dwuwymiarowe sieci",
        sources:
          "https://pl.wikipedia.org/wiki/Krzy%C5%BCakowate https://arages.de/files/checklist2004_araneae.pdf",
      });
      const suggestionImage = await firstSuggestion.$create("image", {
        src: "img/krzyzak.jpg",
        author: "Bartosz Orzechowski",
      });
      const firstFamily = await user.$create("family", {
        adminId: user.id,
        name: "krzyżakowate",
        latinName: "araneidae",
        appearanceDesc:
          "majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krpie majom <br/>krzyz upie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na majomrzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz dupie",
        behaviorDesc: "robią dwuwymiarowe sieci",
        sources:
          "https://pl.wikipedia.org/wiki/Krzy%C5%BCakowate https://arages.de/files/checklist2004_araneae.pdf",
      });
      const familyImage = await firstFamily.$create("image", {
        src: "img/krzyzak.jpg",
        author: "Bartosz Orzechowski",
      });

      const firstSpider = await firstFamily.$create("spider", {
        name: "krzyzak ogrodowy",
        latinName: "araneidae ogrodae",
        appearanceDesc: "ladny jest",
        behaviorDesc: "sieci plecie",
        sources: "https://pl.wikipedia.org/wiki/Krzy%C5%BCakowate",
        userId: user.id,
        adminId: user.id,
      });

      await firstSpider.$create("image", {
        src: "img/krzyzak.jpg",
        author: "Bartosz Orzechowski",
      });
      await firstSpider.$create("image", {
        src: "img/krzyzak2.jpg",
        author: "Bartosz Orzechowski",
      });

      const secondFamily = await user.$create("family", {
        adminId: user.id,
        name: "kwadratnikowate",
        latinName: "Tetragnathidae",
      });
      const secondFamilyImage = await secondFamily.$create("image", {
        src: "img/pajak1.jpg",
        author: "Bartosz Orzechowski",
      });
      const secondSpider = await secondFamily.$create("spider", {
        latinName: "Metellina segmentata",
        userId: user.id,
        adminId: user.id,
      });

      await secondSpider.$create("image", {
        src: "img/pajak1.jpg",
        author: "Bartosz Orzechowski",
      });
    });
};
