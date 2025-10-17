import "@typespec/http";

using TypeSpec.Http;

@service({
  title: "PersonalCard Generator",
  version: "1.0.0",
})
namespace CardGen;

@route("/card")
interface Card {
  @get op preview(): {
    @header contentType: "text/html";
    @body html: string;
  };

  @route("/download")
  @post op download(@body input: CardInput): {
    @header contentType: "image/png";
    @body image: bytes;
  };
}

model CardInput {
  avatar: bytes;          // base64 裁剪后头像
  name: string;
  phone: string;
  email: string;
  homepage: url;
  github: string;
  x: string;
  bio: string;
  theme: "minimal" | "business" | "neon" | "pastel" | "dark" | "sunset" | "ocean" | "forest" | "retro" | "cyber";
}