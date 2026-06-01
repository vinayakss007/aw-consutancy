import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

// GET /api/qr?url=...&size=300&format=png&fgColor=000000&bgColor=ffffff
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    const size = parseInt(searchParams.get("size") || "300");
    const format = searchParams.get("format") || "png"; // png, svg
    const fgColor = searchParams.get("fgColor") || "#000000";
    const bgColor = searchParams.get("bgColor") || "#ffffff";
    const margin = parseInt(searchParams.get("margin") || "2");

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const options: QRCode.QRCodeToDataURLOptions = {
      width: size,
      margin,
      color: {
        dark: fgColor.startsWith("#") ? fgColor : `#${fgColor}`,
        light: bgColor.startsWith("#") ? bgColor : `#${bgColor}`,
      },
    };

    if (format === "svg") {
      const svg = await QRCode.toString(url, {
        type: "svg",
        width: size,
        margin,
        color: {
          dark: fgColor.startsWith("#") ? fgColor : `#${fgColor}`,
          light: bgColor.startsWith("#") ? bgColor : `#${bgColor}`,
        },
      });
      return new NextResponse(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=31536000",
        },
      });
    }

    // PNG as data URL
    const dataUrl = await QRCode.toDataURL(url, options);
    
    // Convert data URL to buffer
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate QR code" },
      { status: 500 }
    );
  }
}

// POST /api/qr - Generate QR code with more options
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      url,
      size = 300,
      format = "dataurl",
      fgColor = "#000000",
      bgColor = "#ffffff",
      margin = 2,
      logo,
    } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const options: QRCode.QRCodeToDataURLOptions = {
      width: size,
      margin,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: logo ? "H" : "M",
    };

    if (format === "svg") {
      const svg = await QRCode.toString(url, {
        type: "svg",
        width: size,
        margin,
        color: { dark: fgColor, light: bgColor },
      });
      return NextResponse.json({ qr: svg, format: "svg" });
    }

    const dataUrl = await QRCode.toDataURL(url, options);
    return NextResponse.json({ qr: dataUrl, format: "dataurl" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
