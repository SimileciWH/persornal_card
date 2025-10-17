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

  @route("/preview/compact")
  @get op previewCompact(): {
    @header contentType: "application/json";
    @body response: CardResponse;
  };

  @route("/download")
  @post op download(@body input: CardInput): {
    @header contentType: "image/png";
    @body image: bytes;
  };

  @route("/download/compact")
  @post op downloadCompact(@body input: CardInput): {
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

@doc("名片响应模型，定义生成名片的布局结构")
model CardResponse {
  @doc("HTML格式名片的完整内容")
  html: string;

  @doc("名片布局配置")
  layout: CardLayout;
}

@doc("名片布局配置")
model CardLayout {
  @doc("布局类型：horizontal-compact（水平紧凑布局）")
  type: "horizontal-compact";

  @doc("各区域的详细配置")
  sections: CardSections;
}

@doc("名片各区域配置")
model CardSections {
  @doc("头部区域：头像+基本信息")
  header: HeaderSection;

  @doc("内容区域：个人简介")
  content: ContentSection;

  @doc("底部区域：社交链接")
  footer: FooterSection;
}

@doc("头部区域配置")
model HeaderSection {
  @doc("头像配置")
  avatar: {
    @doc("头像位置：left")
    position: "left";
    @doc("头像尺寸：small(60px), medium(80px), large(100px)")
    size: "small" | "medium" | "large";
  };

  @doc("联系信息配置")
  contacts: {
    @doc("姓名显示，必须")
    name: string;

    @doc("电话信息，可选")
    phone?: string;

    @doc("邮箱信息，可选")
    email?: string;

    @doc("个人主页，可选")
    homepage?: url;

    @doc("信息排列方式：vertical（垂直排列）")
    arrangement: "vertical";
  };
}

@doc("内容区域配置")
model ContentSection {
  @doc("个人简介文本")
  bio: string;

  @doc("文本对齐方式：left, center, right")
  alignment: "left" | "center" | "right";

  @doc("最大行数限制")
  maxLines?: int32;
}

@doc("底部区域配置")
model FooterSection {
  @doc("社交链接列表")
  socialLinks: SocialLink[];

  @doc("链接排列方式：horizontal（水平排列）")
  arrangement: "horizontal";

  @doc("链接间距：small, medium, large")
  spacing: "small" | "medium" | "large";
}

@doc("社交链接配置")
model SocialLink {
  @doc("平台类型：github, x, linkedin, website 等")
  platform: "github" | "x" | "linkedin" | "website";

  @doc("链接地址")
  url: string;

  @doc("显示文本或用户名")
  username: string;
}